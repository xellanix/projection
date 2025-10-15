import { create } from "zustand";

interface EcoState {
    ecoMode: boolean;
}

interface EcoActions {
    setEcoMode: (ecoMode: boolean) => void;
}

type EcoStore = EcoState & EcoActions;

export const useEcoStore = create<EcoStore>((set) => ({
    ecoMode: false,

    setEcoMode: (ecoMode: boolean) => set({ ecoMode }),
}));
