"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Socket } from "socket.io-client";
import { createSocketConnection } from "@/lib/socketService";
import { generateId, getPlayerName } from "@/lib/utils";

interface SocketContextType {
  socket: Socket | null;
  playerId: string | null;
  playerName: string;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  playerId: null,
  playerName: "Anonymous",
});

export function SocketProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [playerName] = useState<string>(getPlayerName());

  useEffect(() => {
    // Get or create player ID
    let id = localStorage.getItem("playerId");
    if (!id) {
      id = generateId();
      localStorage.setItem("playerId", id);
    }
    setPlayerId(id);

    // Create socket connection
    const socketConnection = createSocketConnection();
    setSocket(socketConnection);

    socketConnection.on("connect", () => {
      console.log("Socket connected:", socketConnection.id);
    });

    socketConnection.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    return () => {
      socketConnection.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, playerId, playerName }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}