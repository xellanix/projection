import type { AppSettings } from "@/types/settings";
import { create } from "zustand";

interface ImportSettingsState {
    isAvailable: boolean;
    data: AppSettings | null;
}

interface ImportSettingsActions {
    setIsAvailable: (isAvailable: boolean) => void;
    setData: (data: AppSettings | null) => void;

    tryToImport: (data: unknown) => void;
}

type ImportSettingsStore = ImportSettingsState & ImportSettingsActions;

export const useImportSettingsStore = create<ImportSettingsStore>((set) => ({
    isAvailable: false,
    data: null,

    setIsAvailable: (isAvailable) => {
        set({ isAvailable, data: null });
    },
    setData: (data) => set({ data }),

    tryToImport: (data) => {
        set({ isAvailable: true, data: data === null ? null : (data as AppSettings) });
    },
}));
