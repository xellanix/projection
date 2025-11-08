import type { Size } from "@/types";

export type SettingsLocalScreenState = {
    black: boolean;
    clear: boolean;
    stopped: boolean;
};
export type SettingsLocalMessageState = {
    message: string;
    isOpen: boolean;
};

export type SettingsGlobalRemapState = {
    screenResolution: Size;
    contentResolution: Size;
    scaleStrategy: "fit" | "fill";
};
export type AppSettings = {
    __internal: {
        id: string;
    };
    remap: SettingsGlobalRemapState;
};
