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

        const origin = window.location.origin;
        let socketUrl = origin;

        // If we are accessing the Vite dev server locally or it's running in DEV mode,
        // point to the Bun backend port
        if (
            origin.includes("localhost:12527") ||
            origin.includes("127.0.0.1:12527") ||
            import.meta.env.DEV
        ) {
            socketUrl = "http://localhost:12526";
        }
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
