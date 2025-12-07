"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSocket } from "./SocketProvider";
import { Game } from "@/lib/types";
import { Users, Plus, Lock } from "lucide-react";

export default function GameLobby() {
  const router = useRouter();
  const { socket, playerId, playerName } = useSocket();
  const [games, setGames] = useState<Game[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [gameName, setGameName] = useState("");

  useEffect(() => {
    if (!socket) return;

    // Request games list
    socket.emit("get-games");

    // Listen for games updates
    socket.on("games-list", (gamesList: Game[]) => {
      setGames(gamesList);
    });

    return () => {
      socket.off("games-list");
    };
  }, [socket]);

  const handleCreateGame = () => {
    if (!socket || !playerId) return;
    const name = gameName.trim() || `${playerName}'s Game`;
    socket.emit("create-game", { playerId, playerName, gameName: name });
    socket.once("game-created", (game: Game) => {
      router.push(`/game/${game.id}`);
    });
  };

  const handleJoinGame = (gameId: string) => {
    router.push(`/game/${gameId}`);
  };

  const handleQuickJoin = () => {
    if (!socket || !playerId) return;
    
    // Find first available game or create new one
    const availableGame = games.find((g) => !g.player2Id);
    
    if (availableGame) {
      handleJoinGame(availableGame.id);
    } else {
      socket.emit("create-game", { playerId, playerName, gameName: `${playerName}'s Game` });
      socket.once("game-created", (game: Game) => {
        router.push(`/game/${game.id}`);
      });
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Player Info & Actions */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-slate-400 text-sm">Playing as</p>
            <p className="text-white text-xl font-semibold">{playerName}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleQuickJoin}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors"
            >
              Quick Join
            </button>
            <button
              onClick={() => setShowCreateDialog(!showCreateDialog)}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold flex items-center gap-2 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Create Game
            </button>
          </div>
        </div>

        {/* Create Game Form */}
        {showCreateDialog && (
          <div className="mt-6 pt-6 border-t border-slate-700">
            <h3 className="text-white text-lg font-semibold mb-4">Create New Game</h3>
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Game name (optional)"
                value={gameName}
                onChange={(e) => setGameName(e.target.value)}
                className="flex-1 px-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-purple-500 focus:outline-none"
              />
              <button
                onClick={handleCreateGame}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors"
              >
                Create
              </button>
              <button
                onClick={() => setShowCreateDialog(false)}
                className="px-6 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Games List */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6">
        <h2 className="text-white text-2xl font-bold mb-6 flex items-center gap-2">
          <Users className="w-6 h-6" />
          Available Games ({games.filter((g) => !g.player2Id).length})
        </h2>

        {games.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-400 text-lg">No games available</p>
            <p className="text-slate-500 mt-2">Create a game to get started!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {games
              .filter((game) => !game.player2Id) // Only show games waiting for player 2
              .map((game) => (
                <div
                  key={game.id}
                  className="bg-slate-700/50 rounded-lg p-4 hover:bg-slate-700 transition-colors cursor-pointer"
                  onClick={() => handleJoinGame(game.id)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-white font-semibold text-lg">{game.name}</h3>
                    {game.player2Id && <Lock className="w-4 h-4 text-slate-400" />}
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-300">
                        {game.player1?.name || "Player 1"}
                        {game.player2 && ` vs ${game.player2.name}`}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          game.player2Id
                            ? "bg-red-500/20 text-red-400"
                            : "bg-green-500/20 text-green-400"
                        }`}
                      >
                        {game.player2Id ? "Full" : "Waiting for player"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}