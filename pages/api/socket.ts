import { Server as NetServer } from "http";
import { NextApiRequest } from "next";
import { Server as ServerIO } from "socket.io";
import { Game, Player, GameStage, ChatMessage, Position, Wall } from "@/lib/types";
import { generateId } from "@/lib/utils";
import { createEmptyBoard, canMoveTo, positionsEqual } from "@/lib/gameLogic";

export const config = {
  api: {
    bodyParser: false,
  },
};

interface NextApiResponseServerIO extends Response {
  socket: {
    server: NetServer & {
      io?: ServerIO;
    };
  };
}

// In-memory storage
const games = new Map<string, Game>();

export default function handler(req: NextApiRequest, res: any) {
  if (!res.socket.server.io) {
    console.log("Setting up Socket.io");
    const io = new ServerIO(res.socket.server, {
      path: "/api/socket",
      addTrailingSlash: false,
    });

    io.on("connection", (socket) => {
      console.log("Client connected:", socket.id);

      // Get games list
      socket.on("get-games", () => {
        const gamesList = Array.from(games.values());
        socket.emit("games-list", gamesList);
      });

      // Create game
      socket.on("create-game", ({ playerId, playerName, gameName }) => {
        const gameId = generateId();
        const player: Player = {
          id: playerId,
          name: playerName,
          board: createEmptyBoard(),
          ready: false,
          isCurrentTurn: true,
        };

        const game: Game = {
          id: gameId,
          name: gameName,
          player1Id: playerId,
          player2Id: null,
          player1: player,
          player2: null,
          stage: GameStage.WAITING,
          currentTurnPlayerId: null,
          winnerId: null,
          createdAt: Date.now(),
        };

        games.set(gameId, game);
        socket.emit("game-created", game);
        io.emit("games-list", Array.from(games.values()));
      });

      // Join game
      socket.on("join-game", ({ gameId, playerId }) => {
        const game = games.get(gameId);
        if (!game) {
          socket.emit("game-not-found");
          return;
        }

        socket.join(gameId);

        // If player is not already in game, add as player 2
        if (game.player1Id !== playerId && !game.player2Id) {
          const playerName = `Player${Math.floor(Math.random() * 9000) + 1000}`;
          const player: Player = {
            id: playerId,
            name: playerName,
            board: createEmptyBoard(),
            ready: false,
            isCurrentTurn: false,
          };
          game.player2Id = playerId;
          game.player2 = player;
          game.stage = GameStage.SETUP;
          games.set(gameId, game);
          io.emit("games-list", Array.from(games.values()));
        }

        io.to(gameId).emit("game-update", game);
      });

      // Submit board
      socket.on("submit-board", ({ gameId, playerId, board }) => {
        const game = games.get(gameId);
        if (!game) return;

        const player = game.player1Id === playerId ? game.player1 : game.player2;
        if (!player) return;

        player.board.entrance = board.entrance;
        player.board.exit = board.exit;
        player.board.walls = board.walls;
        player.ready = true;

        // Check if both players are ready
        if (game.player1?.ready && game.player2?.ready) {
          // Set starting positions
          game.player1.board.playerPosition = game.player2.board.entrance;
          game.player2.board.playerPosition = game.player1.board.entrance;
          
          // Add starting positions to visited cells
          if (game.player1.board.playerPosition) {
            game.player1.board.visitedCells.push(game.player1.board.playerPosition);
          }
          if (game.player2.board.playerPosition) {
            game.player2.board.visitedCells.push(game.player2.board.playerPosition);
          }

          game.stage = GameStage.PLAYING;
          game.currentTurnPlayerId = game.player1.id;
        }

        games.set(gameId, game);
        io.to(gameId).emit("game-update", game);
      });

      // Make move
      socket.on("make-move", ({ gameId, playerId, targetPosition }) => {
        const game = games.get(gameId);
        if (!game || game.currentTurnPlayerId !== playerId) return;

        const isPlayer1 = game.player1Id === playerId;
        const currentPlayer = isPlayer1 ? game.player1 : game.player2;
        const opponent = isPlayer1 ? game.player2 : game.player1;

        if (!currentPlayer || !opponent || !currentPlayer.board.playerPosition) return;

        const canMove = canMoveTo(
          currentPlayer.board.playerPosition,
          targetPosition,
          opponent.board.walls
        );

        if (canMove) {
          // Successful move
          currentPlayer.board.playerPosition = targetPosition;
          currentPlayer.board.visitedCells.push(targetPosition);

          // Check if reached exit
          if (positionsEqual(targetPosition, opponent.board.exit)) {
            game.stage = GameStage.FINISHED;
            game.winnerId = playerId;
          }
        } else {
          // Hit a wall - add to spotted walls
          const wall: Wall = {
            from: currentPlayer.board.playerPosition,
            to: targetPosition,
          };
          currentPlayer.board.spottedWalls.push(wall);

          // Switch turn
          game.currentTurnPlayerId = opponent.id;
        }

        games.set(gameId, game);
        io.to(gameId).emit("game-update", game);
      });

      // Send chat message
      socket.on("send-message", ({ gameId, playerId, playerName, text }) => {
        const message: ChatMessage = {
          id: generateId(),
          gameId,
          playerId,
          playerName,
          text,
          timestamp: Date.now(),
        };
        io.to(gameId).emit("chat-message", message);
      });

      // Leave game
      socket.on("leave-game", ({ gameId, playerId }) => {
        const game = games.get(gameId);
        if (!game) return;

        socket.leave(gameId);

        // Remove game if in setup or waiting
        if (game.stage === GameStage.WAITING || game.stage === GameStage.SETUP) {
          games.delete(gameId);
          io.emit("games-list", Array.from(games.values()));
        } else {
          // If game is playing, declare other player winner
          const winnerId = game.player1Id === playerId ? game.player2Id : game.player1Id;
          game.winnerId = winnerId;
          game.stage = GameStage.FINISHED;
          games.set(gameId, game);
          io.to(gameId).emit("game-update", game);
        }
      });

      socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
      });
    });

    res.socket.server.io = io;
  }

  res.end();
}