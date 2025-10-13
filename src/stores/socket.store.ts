import { type Socket } from "socket.io-client";
import { create } from "zustand";

interface SocketState {
    socket: Socket | null;
    socketId: string | null;
}

interface SocketActions {
    setSocket: (socket: Socket | null) => void;
    setSocketId: (socketId: string | null) => void;
}

type SocketStore = SocketState & SocketActions;

export const useSocketStore = create<SocketStore>((set) => ({
    socket: null,
    socketId: null,

    setSocket: (socket) => set({ socket }),
    setSocketId: (socketId) => set({ socketId }),
}));
