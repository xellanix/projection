"use client";

import { useSocketStore } from "@/stores/socket.store";
import { useEffect } from "react";
import { io } from "socket.io-client";
import { useShallow } from "zustand/react/shallow";

export function SocketInitiator() {
    const [setSocket, setSocketId, setLocal] = useSocketStore(
        useShallow((s) => [s.setSocket, s.setSocketId, s.setLocal]),
    );

    useEffect(() => {
        if (typeof window === "undefined") return;

        const socketUrl = window.location.origin;
        const newSocket = io(socketUrl, {
            path: "/api/socket_io",
            transports: ["websocket"],
        });
        setSocket(newSocket);

        newSocket.on("connect", () => {
            setSocketId(newSocket.id!);
            console.log("✅ Connected to server");
        });

        newSocket.on("server:socket:isLocal", setLocal);

        newSocket.on("connect_error", (err) => {
            console.error("Socket connection error:", err);
        });

        newSocket.on("disconnect", () => {
            setSocketId(null);
            console.log("❌ Disconnected from server");
        });

        return () => {
            newSocket.disconnect();
        };
    }, [setSocket, setSocketId, setLocal]);

    return null;
}
