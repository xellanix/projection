import type { Size } from "@/types";
import type { WritableDraft } from "immer";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

interface SettingsLocalScreenState {
    black: boolean;
    clear: boolean;
    stopped: boolean;
}
interface SettingsLocalMessageState {
    message: string;
    isOpen: boolean;
}

interface SettingsGlobalRemapState {
    screenResolution: Size;
    contentResolution: Size;
}

interface SettingsState {
    local: {
        screen: SettingsLocalScreenState;
        message: SettingsLocalMessageState;
    };
    global: {
        remap: SettingsGlobalRemapState;
    };
}

interface SettingsActions {
    set: <T = SettingsStore, P = T | Partial<T>>(
        partial: P | ((state: WritableDraft<T>) => void),
    ) => void;

    setScreen: (partial: Partial<SettingsLocalScreenState>) => void;

    setMessage: (message: string, isOpen: boolean) => void;
    toggleMessage: (force?: boolean) => void;

    setRemap: (partial: Partial<SettingsGlobalRemapState>) => void;
}

type SettingsStore = SettingsState & SettingsActions;

export const useSettingsStore = create<SettingsStore>()(
    immer((set) => ({
        local: {
            screen: {
                black: false,
                clear: false,
                stopped: false,
            },
            message: {
                message: "",
                isOpen: false,
            },
        },
        global: {
            remap: {
                screenResolution: {
                    width: 1920,
                    height: 1080,
                },
                contentResolution: {
                    width: 1920,
                    height: 1080,
                },
            },
        },

        set,

        setScreen: (partial) => {
            set((s) => {
                Object.assign(s.local.screen, partial);
            });
        },

        setMessage: (message: string, isOpen: boolean) => {
            set((s) => {
                s.local.message.message = message;
                s.local.message.isOpen = isOpen;
            });
        },
        toggleMessage: (force?: boolean) => {
            set((s) => {
                s.local.message.isOpen = force ?? !s.local.message.isOpen;
            });
        },

        setRemap: (partial) => {
            set((s) => {
                Object.assign(s.global.remap, partial);
            });
        },
    })),
);
