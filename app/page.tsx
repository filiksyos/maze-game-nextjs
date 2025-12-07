import GameLobby from "@/components/GameLobby";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-2">Usogui Maze Game</h1>
          <p className="text-slate-300">Create mazes, challenge opponents, find the exit!</p>
        </div>
        <GameLobby />
      </div>
    </main>
  );
}