import { io, Socket } from "socket.io-client";

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL || "http://localhost:3000";

let socket: Socket | null = null;

/**
 * Create socket connection
 */
export const getSocket = (): Socket => {
  if (socket) return socket;

  socket = io(SOCKET_URL, {
    withCredentials: true,           
    transports: ["websocket"],      
    autoConnect: false,             
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  return socket;
};
