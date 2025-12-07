# Usogui Maze Game - Next.js

🎮 A multiplayer maze game inspired by the Usogui manga, built with Next.js 15, TypeScript, and Socket.io.

## Features

✨ **Core Features:**
- 🏗️ **Maze Creator** - Design custom mazes with entrance, exit, and walls
- 🎯 **Turn-based Gameplay** - Strategic maze navigation against opponents
- 👥 **Real-time Multiplayer** - Play with friends using Socket.io
- 💬 **In-game Chat** - Communicate with your opponent
- 🎲 **Game Lobby** - Browse and join available games
- 🧠 **Smart Validation** - Move checking, wall detection, and collision logic

## Tech Stack

- **Framework:** Next.js 15.0.3 (App Router)
- **Language:** TypeScript 5.6.3
- **Styling:** Tailwind CSS 3.4.15
- **Real-time:** Socket.io 4.8.1
- **Icons:** Lucide React 0.460.0
- **UI Components:** Radix UI primitives

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, or pnpm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/filiksyos/maze-game-nextjs.git
cd maze-game-nextjs
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## How to Play

### 1. Join or Create a Game
- **Quick Join:** Automatically join an available game or create a new one
- **Create Game:** Start your own game with a custom name

### 2. Design Your Maze
- Place your **entrance** (green) on the border
- Place your **exit** (red) on the border  
- Create **walls** (purple) by clicking two adjacent cells
- Click "Ready!" when finished

### 3. Navigate the Opponent's Maze
- Start at the opponent's entrance
- Click highlighted cells to move
- **Green cells** = available moves
- **Red walls** = discovered walls (blocked paths)
- **Goal:** Reach the opponent's exit!

### 4. Game Rules
- Turn-based: players alternate moves
- If you hit a wall, your turn ends and the wall is revealed
- First player to reach opponent's exit wins! 🎉

## Project Structure

```
├── app/
│   ├── game/[gameId]/     # Game page (dynamic route)
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home/lobby page
├── components/
│   ├── BoardCreator.tsx   # Maze design interface
│   ├── GameBoard.tsx      # Gameplay board
│   ├── GameChat.tsx       # Chat component
│   ├── GameLobby.tsx      # Lobby UI
│   └── SocketProvider.tsx # Socket context
├── lib/
│   ├── gameLogic.ts       # Core game logic
│   ├── socketService.ts   # Socket client setup
│   ├── types.ts           # TypeScript types
│   └── utils.ts           # Utility functions
├── pages/api/
│   └── socket.ts          # Socket.io server
└── public/                # Static assets
```

## Game Logic Highlights

### Move Validation
- Players can only move to adjacent cells (up, down, left, right)
- Moves are validated against opponent's walls
- Spotted walls are tracked and displayed

### Board Setup
- 10x10 grid
- Entrance and exit must be on borders
- Walls connect two adjacent cells
- Both players must be ready to start

### Win Condition
- Reach the opponent's exit position
- Game automatically detects winner

## Configuration

No environment variables needed! The game works out of the box with:
- Local in-memory game storage
- Client-side player ID generation
- Auto-generated player names

## Development

### Build for Production
```bash
npm run build
npm start
```

### Lint Code
```bash
npm run lint
```

## Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest features  
- Submit pull requests

## License

MIT License - feel free to use this project for learning or building your own games!

## Acknowledgments

- Inspired by **Usogui** manga by Toshio Sako
- Based on [XcenaX/UsoguiMazeGame](https://github.com/XcenaX/UsoguiMazeGame)
- Chat implementation inspired by [raptr45/realtime_chat](https://github.com/raptr45/realtime_chat)

---

**Enjoy the game! 🎮✨**