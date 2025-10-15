import { create } from "zustand";
import { persist } from "zustand/middleware";

interface EcoState {
    ecoMode: boolean;
}

interface EcoActions {
    setEcoMode: (ecoMode: boolean) => void;
}

type EcoStore = EcoState & EcoActions;

export const useEcoStore = create<EcoStore>()(
    persist<EcoStore>(
        (set) => ({
            ecoMode: false,

            setEcoMode: (ecoMode: boolean) => set({ ecoMode }),
        }),
        { name: "xellanix-projection-eco-storage" },
    ),
);
