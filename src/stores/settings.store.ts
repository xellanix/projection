import { defaultSettings } from "@/data/settings";
import type {
    AppSettings,
    SettingsLocalMessageState,
    SettingsLocalScreenState,
} from "@/types/settings";
import type { WritableDraft } from "immer";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

interface SettingsState {
    local: {
        screen: SettingsLocalScreenState;
        message: SettingsLocalMessageState;
    };
    global: AppSettings;
    temp: {
        activePage: string;
    } & AppSettings;
}

interface SettingsActions {
    set: <T = SettingsStore, P = T | Partial<T>>(
        partial: P | ((state: WritableDraft<T>) => void),
    ) => void;

    setScreen: (partial: Partial<SettingsLocalScreenState>) => void;

    setMessage: (message: string, isOpen: boolean) => void;
    toggleMessage: (force?: boolean) => void;

    setActivePage: (page: string) => void;

    setCover: (partial: Partial<AppSettings["cover"]>) => void;
    setRemap: (partial: Partial<AppSettings["remap"]>) => void;
}

type SettingsStore = SettingsState & SettingsActions;

export const useSettingsStore = create<SettingsStore>()(
    immer((set) => ({
        local: {
            screen: {
                black: false,
                clear: false,
                transparent: false,
                cover: false,
                stopped: false,
            },
            message: {
                message: "",
                isOpen: false,
            },
        },
        global: defaultSettings,
        temp: {
            ...defaultSettings,
            activePage: "1",
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

        setActivePage: (page: string) => {
            set((s) => {
                s.temp.activePage = page;
            });
        },

        setCover: (partial) => {
            set((s) => {
                Object.assign(s.global.cover, partial);
            });
        },
        setRemap: (partial) => {
            set((s) => {
                Object.assign(s.global.remap, partial);
            });
        },
    })),
);
