"use client";

import { useState, useEffect } from "react";
import { useSocket } from "./SocketProvider";
import { Game, Player, Position } from "@/lib/types";
import { BOARD_SIZE, positionsEqual, getAvailableMoves } from "@/lib/gameLogic";

interface GameBoardProps {
  game: Game;
  playerId: string;
  myPlayer: Player;
  opponent: Player | null;
}

export default function GameBoard({ game, playerId, myPlayer, opponent }: GameBoardProps) {
  const { socket } = useSocket();
  const [availableMoves, setAvailableMoves] = useState<Position[]>([]);

  useEffect(() => {
    if (game.currentTurnPlayerId === playerId && myPlayer.board.playerPosition) {
      const moves = getAvailableMoves(
        myPlayer.board.playerPosition,
        myPlayer.board.spottedWalls
      );
      setAvailableMoves(moves);
    } else {
      setAvailableMoves([]);
    }
  }, [game.currentTurnPlayerId, myPlayer.board.playerPosition, myPlayer.board.spottedWalls, playerId]);

  const handleCellClick = (x: number, y: number) => {
    if (game.currentTurnPlayerId !== playerId || !socket) return;

    const targetPos: Position = { x, y };
    const canMove = availableMoves.some((pos) => positionsEqual(pos, targetPos));

    if (canMove) {
      socket.emit("make-move", {
        gameId: game.id,
        playerId,
        targetPosition: targetPos,
      });
    }
  };

  const isCellVisited = (x: number, y: number) => {
    return myPlayer.board.visitedCells.some((pos) => pos.x === x && pos.y === y);
  };

  const isAvailableMove = (x: number, y: number) => {
    return availableMoves.some((pos) => pos.x === x && pos.y === y);
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-white text-2xl font-bold">Opponent's Maze</h2>
        <div className="text-slate-300">
          {opponent?.board.exit ? (
            <span>Find the exit at the borders!</span>
          ) : (
            <span>Exploring...</span>
          )}
        </div>
      </div>

      {/* Board */}
      <div className="mb-6">
        <div className="inline-block bg-slate-900 p-4 rounded-lg relative">
          <div className="grid gap-0 relative" style={{ gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)` }}>
            {Array.from({ length: BOARD_SIZE }).map((_, y) =>
              Array.from({ length: BOARD_SIZE }).map((_, x) => {
                const isCurrentPos = positionsEqual(myPlayer.board.playerPosition, { x, y });
                const isExit = opponent?.board.exit && positionsEqual(opponent.board.exit, { x, y });
                const visited = isCellVisited(x, y);
                const canMoveHere = isAvailableMove(x, y);

                return (
                  <button
                    key={`${x}-${y}`}
                    onClick={() => handleCellClick(x, y)}
                    disabled={!canMoveHere}
                    className={`w-10 h-10 border border-slate-700 transition-all ${
                      isCurrentPos
                        ? "bg-blue-500 scale-110"
                        : isExit
                        ? "bg-red-500"
                        : canMoveHere
                        ? "bg-green-400 hover:bg-green-500 cursor-pointer animate-pulse"
                        : visited
                        ? "bg-slate-600"
                        : "bg-slate-800"
                    } ${
                      canMoveHere ? "" : "cursor-not-allowed"
                    }`}
                  >
                    {isCurrentPos && <span className="text-white text-xl">●</span>}
                  </button>
                );
              })
            )}
            {/* Spotted Walls overlay */}
            <svg
              className="absolute top-0 left-0 pointer-events-none"
              style={{
                width: BOARD_SIZE * 40,
                height: BOARD_SIZE * 40,
              }}
            >
              {myPlayer.board.spottedWalls.map((wall, idx) => {
                // Walls should be drawn on the EDGE between cells, not center to center
                // x = column (horizontal), y = row (vertical)
                const fromX = wall.from.x;
                const fromY = wall.from.y;
                const toX = wall.to.x;
                const toY = wall.to.y;
                
                // Determine if wall is horizontal or vertical
                if (fromY === toY) {
                  // Horizontal wall (same row, different columns)
                  const y = fromY * 40 + 40; // Bottom edge of the row
                  const x1 = Math.min(fromX, toX) * 40 + 40;
                  const x2 = x1;
                  const y1 = (fromY) * 40;
                  const y2 = (fromY + 1) * 40;
                  return (
                    <line
                      key={idx}
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke="#ef4444"
                      strokeWidth="4"
                    />
                  );
                } else {
                  // Vertical wall (same column, different rows)
                  const x = fromX * 40 + 40; // Right edge of the column
                  const y1 = Math.min(fromY, toY) * 40 + 40;
                  const y2 = y1;
                  const x1 = (fromX) * 40;
                  const x2 = (fromX + 1) * 40;
                  return (
                    <line
                      key={idx}
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke="#ef4444"
                      strokeWidth="4"
                    />
                  );
                }
              })}
            </svg>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="bg-slate-700/50 rounded p-3">
          <p className="text-slate-400">Cells Visited</p>
          <p className="text-white text-xl font-bold">{myPlayer.board.visitedCells.length}</p>
        </div>
        <div className="bg-slate-700/50 rounded p-3">
          <p className="text-slate-400">Walls Found</p>
          <p className="text-white text-xl font-bold">{myPlayer.board.spottedWalls.length}</p>
        </div>
      </div>
    </div>
  );
}