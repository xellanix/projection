import { type Socket } from "socket.io-client";
import { create } from "zustand";

interface SocketState {
    socket: Socket | null;
    socketId: string | null;
    isLocal: boolean;
}

interface SocketActions {
    setSocket: (socket: Socket | null) => void;
    setSocketId: (socketId: string | null) => void;
    setLocal: (isLocal: boolean) => void;
}

type SocketStore = SocketState & SocketActions;

export const useSocketStore = create<SocketStore>((set) => ({
    socket: null,
    socketId: null,
    isLocal: false,

    setSocket: (socket) => set({ socket }),
    setSocketId: (socketId) => set({ socketId }),
    setLocal: (isLocal) => set({ isLocal }),
}));
