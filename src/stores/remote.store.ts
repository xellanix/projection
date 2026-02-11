import { create } from "zustand";

export interface RemoteState {
    url?: string;
}

interface RemoteActions {
    setUrl: (url?: string) => void;
}

type RemoteStore = RemoteState & RemoteActions;

export const useRemoteStore = create<RemoteStore>((set) => ({
    url: undefined,

    setUrl: (url) => set({ url }),
}));
