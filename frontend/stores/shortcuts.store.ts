import { create } from "zustand";
import type { Accelerator } from "@/types";

type Shortcuts = Record<string, () => void>;

interface ShortcutsState {
    shortcuts: Shortcuts;
    isPaused: boolean;
}

interface ShortcutsActions {
    registerShortcut: (accelerator: Accelerator, callback: () => void) => void;
    unregisterShortcut: (accelerator: Accelerator) => void;
    pauseShortcuts: () => void;
    resumeShortcuts: () => void;
    toggleShortcuts: (forceEnable?: boolean) => void;
}

type ShortcutsStore = ShortcutsState & ShortcutsActions;

export const useShortcutsStore = create<ShortcutsStore>((set) => ({
    shortcuts: {},
    isPaused: false,

    registerShortcut: (accelerator, callback) => {
        set((state) => ({
            shortcuts: { ...state.shortcuts, [getAcceleratorHash(accelerator)]: callback },
        }));
    },

    unregisterShortcut: (accelerator) => {
        set((state) => {
            const hash = getAcceleratorHash(accelerator);
            const newShortcuts = { ...state.shortcuts };
            delete newShortcuts[hash];
            return { shortcuts: newShortcuts };
        });
    },

    pauseShortcuts: () => set({ isPaused: true }),
    resumeShortcuts: () => set({ isPaused: false }),
    toggleShortcuts: (forceEnable) => {
        set((state) => ({
            isPaused: forceEnable !== undefined ? !forceEnable : !state.isPaused,
        }));
    },
}));

export const getAcceleratorHash = (accel: Accelerator) => {
    return `${!!accel.ctrl}-${!!accel.meta}-${!!accel.alt}-${!!accel.shift}-${accel.key.toLowerCase()}`;
};
