/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import type { WritableDraft } from "immer";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

interface SettingsScreenState {
    black: boolean;
    clear: boolean;
    stopped: boolean;
}
interface SettingsMessageState {
    message: string;
    isOpen: boolean;
}

interface SettingsState {
    local: {
        screen: SettingsScreenState;
        message: SettingsMessageState;
    };
}

interface SettingsActions {
    set: <T = SettingsStore, P = T | Partial<T>>(
        partial: P | ((state: WritableDraft<T>) => void),
    ) => void;

    setScreen: (partial: Partial<SettingsScreenState>) => void;

    setMessage: (message: string, isOpen: boolean) => void;
    toggleMessage: (force?: boolean) => void;
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
    })),
);
