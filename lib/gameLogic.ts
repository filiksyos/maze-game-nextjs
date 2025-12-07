import { Position, Wall, Board } from "./types";

export const BOARD_SIZE = 10;

export function createEmptyBoard(): Board {
  return {
    entrance: null,
    exit: null,
    walls: [],
    playerPosition: null,
    visitedCells: [],
    spottedWalls: [],
  };
}

export function positionsEqual(p1: Position | null, p2: Position | null): boolean {
  if (!p1 || !p2) return false;
  return p1.x === p2.x && p1.y === p2.y;
}

export function wallExists(walls: Wall[], from: Position, to: Position): boolean {
  return walls.some(
    (wall) =>
      (positionsEqual(wall.from, from) && positionsEqual(wall.to, to)) ||
      (positionsEqual(wall.from, to) && positionsEqual(wall.to, from))
  );
}

export function getAvailableMoves(
  currentPosition: Position,
  spottedWalls: Wall[]
): Position[] {
  const moves: Position[] = [];
  const directions = [
    { x: 0, y: -1 }, // up
    { x: 1, y: 0 },  // right
    { x: 0, y: 1 },  // down
    { x: -1, y: 0 }, // left
  ];

  directions.forEach((dir) => {
    const newPos: Position = {
      x: currentPosition.x + dir.x,
      y: currentPosition.y + dir.y,
    };

    // Check bounds
    if (newPos.x < 0 || newPos.x >= BOARD_SIZE || newPos.y < 0 || newPos.y >= BOARD_SIZE) {
      return;
    }

    // Check if there's a spotted wall blocking this move
    if (!wallExists(spottedWalls, currentPosition, newPos)) {
      moves.push(newPos);
    }
  });

  return moves;
}

export function canMoveTo(
  currentPosition: Position,
  targetPosition: Position,
  opponentWalls: Wall[]
): boolean {
  // Check if positions are adjacent
  const dx = Math.abs(targetPosition.x - currentPosition.x);
  const dy = Math.abs(targetPosition.y - currentPosition.y);
  if (!((dx === 1 && dy === 0) || (dx === 0 && dy === 1))) {
    return false;
  }

  // Check if there's a wall blocking the move
  return !wallExists(opponentWalls, currentPosition, targetPosition);
}

export function isValidBoardSetup(board: Board): boolean {
  // Just check that entrance and exit are placed
  // No border restriction - entrance/exit can be anywhere
  return board.entrance !== null && board.exit !== null;
}