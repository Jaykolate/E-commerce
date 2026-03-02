import { useEffect, useRef } from "react";
import { io } from "socket.io-client";

let socket = null;

export const useSocket = (token) => {
    const socketRef = useRef(null);

    useEffect(() => {
        if (!token) return;

        socket = io(import.meta.env.VITE_API_URL || "http://localhost:5000", {
            auth: { token },
            transports: ["websocket"],
        });

        socketRef.current = socket;

        socket.on("connect", () => {
            console.log("Socket connected:", socket.id);
        });

        socket.on("disconnect", () => {
            console.log("Socket disconnected");
        });

        return () => {
            socket.disconnect();
        };
    }, [token]);

    return socketRef.current;
};

export const getSocket = () => socket;