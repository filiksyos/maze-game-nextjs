import { io, Socket } from "socket.io-client";

export function createSocketConnection(): Socket {
  const socket = io({
    path: "/api/socket",
    addTrailingSlash: false,
  });

  return socket;
}