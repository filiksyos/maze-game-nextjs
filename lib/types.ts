export interface Position {
  x: number;
  y: number;
}

export interface Wall {
  from: Position;
  to: Position;
}

export interface Board {
  entrance: Position | null;
  exit: Position | null;
  walls: Wall[];
  playerPosition: Position | null;
  visitedCells: Position[];
  spottedWalls: Wall[];
}

export interface Player {
  id: string;
  name: string;
  board: Board;
  ready: boolean;
  isCurrentTurn: boolean;
}

export enum GameStage {
  WAITING = "waiting",
  SETUP = "setup",
  PLAYING = "playing",
  FINISHED = "finished",
}

export interface Game {
  id: string;
  name: string;
  player1Id: string | null;
  player2Id: string | null;
  player1: Player | null;
  player2: Player | null;
  stage: GameStage;
  currentTurnPlayerId: string | null;
  winnerId: string | null;
  createdAt: number;
}

export interface ChatMessage {
  id: string;
  gameId: string;
  playerId: string;
  playerName: string;
  text: string;
  timestamp: number;
}