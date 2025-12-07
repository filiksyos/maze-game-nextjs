"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import BoardCreator from "@/components/BoardCreator";
import GameBoard from "@/components/GameBoard";
import GameChat from "@/components/GameChat";
import { useSocket } from "@/components/SocketProvider";
import { Game, GameStage } from "@/lib/types";
import { ArrowLeft } from "lucide-react";

interface PageProps {
  params: Promise<{ gameId: string }>;
}

export default function GamePage({ params }: PageProps) {
  const { gameId } = use(params);
  const router = useRouter();
  const { socket, playerId } = useSocket();
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!socket || !playerId) return;

    // Join game
    socket.emit("join-game", { gameId, playerId });

    // Listen for game updates
    socket.on("game-update", (updatedGame: Game) => {
      setGame(updatedGame);
      setLoading(false);
    });

    socket.on("game-not-found", () => {
      router.push("/");
    });

    socket.on("game-full", () => {
      alert("Game is full!");
      router.push("/");
    });

    return () => {
      socket.off("game-update");
      socket.off("game-not-found");
      socket.off("game-full");
    };
  }, [socket, gameId, playerId, router]);

  const handleLeaveGame = () => {
    if (socket && playerId) {
      socket.emit("leave-game", { gameId, playerId });
      router.push("/");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading game...</div>
      </div>
    );
  }

  if (!game) {
    return null;
  }

  const isPlayer1 = game.player1Id === playerId;
  const isPlayer2 = game.player2Id === playerId;
  const myPlayer = isPlayer1 ? game.player1 : game.player2;
  const opponent = isPlayer1 ? game.player2 : game.player1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={handleLeaveGame}
            className="flex items-center gap-2 text-white hover:text-slate-300 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Leave Game
          </button>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white">{game.name}</h1>
            <p className="text-slate-300 text-sm">Game ID: {game.id}</p>
          </div>
          <div className="w-24" />
        </div>

        {/* Game Status */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-4 mb-6 text-center">
          {game.stage === GameStage.WAITING && (
            <p className="text-yellow-400">Waiting for opponent to join...</p>
          )}
          {game.stage === GameStage.SETUP && (
            <p className="text-blue-400">Setup your maze! Place entrance, exit, and walls.</p>
          )}
          {game.stage === GameStage.PLAYING && (
            <p className="text-green-400">
              {game.currentTurnPlayerId === playerId
                ? "Your turn! Navigate the maze."
                : "Opponent's turn..."}
            </p>
          )}
          {game.stage === GameStage.FINISHED && (
            <p className="text-purple-400 text-xl font-bold">
              {game.winnerId === playerId ? "🎉 You Won!" : "😢 You Lost"}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Game Area */}
          <div className="lg:col-span-2">
            {game.stage === GameStage.SETUP && myPlayer && (
              <BoardCreator
                gameId={game.id}
                playerId={playerId!}
                playerBoard={myPlayer.board}
                isReady={myPlayer.ready}
              />
            )}
            {game.stage === GameStage.PLAYING && myPlayer && (
              <GameBoard
                game={game}
                playerId={playerId!}
                myPlayer={myPlayer}
                opponent={opponent}
              />
            )}
            {game.stage === GameStage.FINISHED && myPlayer && (
              <GameBoard
                game={game}
                playerId={playerId!}
                myPlayer={myPlayer}
                opponent={opponent}
              />
            )}
            {game.stage === GameStage.WAITING && (
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-8 text-center">
                <p className="text-white text-xl mb-4">Waiting for another player...</p>
                <p className="text-slate-400">Share this game ID with a friend!</p>
                <div className="mt-4 p-4 bg-slate-700/50 rounded font-mono text-white">
                  {game.id}
                </div>
              </div>
            )}
          </div>

          {/* Chat Sidebar */}
          <div className="lg:col-span-1">
            <GameChat gameId={game.id} playerId={playerId!} />
          </div>
        </div>
      </div>
    </div>
  );
}