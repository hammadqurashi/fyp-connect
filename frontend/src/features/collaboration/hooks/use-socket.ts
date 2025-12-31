import { useEffect, useRef, useState } from "react";
import io, { Socket } from "socket.io-client";
import { useSelector } from "react-redux";
import { AppConfig } from "@/core/config";

export const useSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const user = useSelector((state: any) => state.auth.user);
  const token = useSelector((state: any) => state.auth.token);

  useEffect(() => {
    if (!user || !token) return;

    const socket = io(AppConfig.baseUrl, {
      auth: {
        token,
      },
      transports: ["websocket", "polling"],
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setIsConnected(true);
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
    });

    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      setIsConnected(false);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user, token]);

  return {
    socket: socketRef.current,
    isConnected,
  };
};
