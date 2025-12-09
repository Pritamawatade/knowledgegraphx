"use client";

import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

export const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    // Connect to same origin, same path
    const socketInstance: Socket = io({
      path: "/socket.io",
    });

    setSocket(socketInstance);

    socketInstance.on("connect", () => {
      console.log("✅ Connected to socket server:", socketInstance.id);
    });

    socketInstance.on("disconnect", () => {
      console.log("⛔ Disconnected from socket server");
    });

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  return socket;
};
