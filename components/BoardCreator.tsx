"use client";

import { useState } from "react";
import { useSocket } from "./SocketProvider";
import { Board, Position, Wall } from "@/lib/types";
import { BOARD_SIZE, positionsEqual, wallExists } from "@/lib/gameLogic";
import { Check } from "lucide-react";

interface BoardCreatorProps {
  gameId: string;
  playerId: string;
  playerBoard: Board;
  isReady: boolean;
}

enum PlacementMode {
  ENTRANCE = "entrance",
  EXIT = "exit",
  WALL = "wall",
}

export default function BoardCreator({
  gameId,
  playerId,
  playerBoard,
  isReady,
}: BoardCreatorProps) {
  const { socket } = useSocket();
  const [mode, setMode] = useState<PlacementMode>(PlacementMode.ENTRANCE);
  const [entrance, setEntrance] = useState<Position | null>(playerBoard.entrance);
  const [exit, setExit] = useState<Position | null>(playerBoard.exit);
  const [walls, setWalls] = useState<Wall[]>(playerBoard.walls);
  const [wallStart, setWallStart] = useState<Position | null>(null);

  const handleCellClick = (x: number, y: number) => {
    if (isReady) return;

    const pos: Position = { x, y };

    if (mode === PlacementMode.ENTRANCE) {
      // Toggle: if clicking on same cell, remove entrance
      if (entrance && positionsEqual(entrance, pos)) {
        setEntrance(null);
      } else {
        // If clicking on exit cell, remove exit
        if (exit && positionsEqual(exit, pos)) {
          setExit(null);
        }
        // Place entrance at new position
        setEntrance(pos);
      }
    } else if (mode === PlacementMode.EXIT) {
      // Toggle: if clicking on same cell, remove exit
      if (exit && positionsEqual(exit, pos)) {
        setExit(null);
      } else {
        // If clicking on entrance cell, remove entrance
        if (entrance && positionsEqual(entrance, pos)) {
          setEntrance(null);
        }
        // Place exit at new position
        setExit(pos);
      }
    } else if (mode === PlacementMode.WALL) {
      if (!wallStart) {
        console.log('Wall start:', pos);
        setWallStart(pos);
      } else {
        // Check if positions are adjacent
        const dx = Math.abs(pos.x - wallStart.x);
        const dy = Math.abs(pos.y - wallStart.y);
        if ((dx === 1 && dy === 0) || (dx === 0 && dy === 1)) {
          const newWall: Wall = { from: wallStart, to: pos };
          console.log('Creating wall:', newWall);
          if (!wallExists(walls, wallStart, pos)) {
            setWalls([...walls, newWall]);
          }
        }
        setWallStart(null);
      }
    }
  };

  const handleSubmitBoard = () => {
    if (!socket || !entrance || !exit) return;

    socket.emit("submit-board", {
      gameId,
      playerId,
      board: { entrance, exit, walls },
    });
  };

  const isOnBorder = (x: number, y: number) => {
    return x === 0 || x === BOARD_SIZE - 1 || y === 0 || y === BOARD_SIZE - 1;
  };

  const canSubmit = entrance !== null && exit !== null && !isReady;

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6">
      <h2 className="text-white text-2xl font-bold mb-4">Design Your Maze</h2>

      {/* Mode Selection */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={() => setMode(PlacementMode.ENTRANCE)}
          disabled={isReady}
          className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
            mode === PlacementMode.ENTRANCE
              ? "bg-green-600 text-white"
              : "bg-slate-700 text-slate-300 hover:bg-slate-600"
          } ${isReady ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          Place Entrance
        </button>
        <button
          onClick={() => setMode(PlacementMode.EXIT)}
          disabled={isReady}
          className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
            mode === PlacementMode.EXIT
              ? "bg-red-600 text-white"
              : "bg-slate-700 text-slate-300 hover:bg-slate-600"
          } ${isReady ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          Place Exit
        </button>
        <button
          onClick={() => setMode(PlacementMode.WALL)}
          disabled={isReady}
          className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
            mode === PlacementMode.WALL
              ? "bg-purple-600 text-white"
              : "bg-slate-700 text-slate-300 hover:bg-slate-600"
          } ${isReady ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          Place Walls {wallStart && "(click adjacent cell)"}
        </button>
      </div>

      {/* Board */}
      <div className="mb-6">
        <div className="inline-block bg-slate-900 p-4 rounded-lg relative">
          <div className="grid gap-0 relative" style={{ gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)` }}>
            {Array.from({ length: BOARD_SIZE }).map((_, y) =>
              Array.from({ length: BOARD_SIZE }).map((_, x) => {
                const isEntrance = positionsEqual(entrance, { x, y });
                const isExit = positionsEqual(exit, { x, y });
                const isWallStartCell = positionsEqual(wallStart, { x, y });
                const isBorder = isOnBorder(x, y);

                return (
                  <button
                    key={`${x}-${y}`}
                    onClick={() => handleCellClick(x, y)}
                    disabled={isReady}
                    className={`w-10 h-10 border border-slate-700 transition-colors ${
                      isEntrance
                        ? "bg-green-500"
                        : isExit
                        ? "bg-red-500"
                        : isWallStartCell
                        ? "bg-purple-400"
                        : isBorder
                        ? "bg-slate-700 hover:bg-slate-600"
                        : "bg-slate-800 hover:bg-slate-700"
                    } ${isReady ? "cursor-not-allowed" : "cursor-pointer"}`}
                  />
                );
              })
            )}
            {/* Walls overlay */}
            <svg
              className="absolute top-0 left-0 pointer-events-none"
              style={{
                width: BOARD_SIZE * 40,
                height: BOARD_SIZE * 40,
              }}
            >
              {walls.map((wall, idx) => {
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
                      stroke="#a855f7"
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
                      stroke="#a855f7"
                      strokeWidth="4"
                    />
                  );
                }
              })}
            </svg>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleSubmitBoard}
          disabled={!canSubmit}
          className={`px-6 py-3 rounded-lg font-semibold flex items-center gap-2 ${
            canSubmit
              ? "bg-blue-600 hover:bg-blue-700 text-white"
              : "bg-slate-600 text-slate-400 cursor-not-allowed"
          }`}
        >
          <Check className="w-5 h-5" />
          {isReady ? "Waiting for opponent..." : "Ready!"}
        </button>
        {!canSubmit && !isReady && (
          <p className="text-yellow-400 text-sm">Place entrance and exit to continue</p>
        )}
      </div>
    </div>
  );
}