import type { Size } from "@/types";

export type SettingsLocalScreenState = {
    black: boolean;
    clear: boolean;
    transparent: boolean;
    cover: boolean;
    stopped: boolean;
};
export type SettingsLocalMessageState = {
    message: string;
    isOpen: boolean;
};

export type SettingsGlobalCoverState = {
    type: "image" | "video";
    content: string;
    scaleStrategy: "fit" | "fill";
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
    cover: SettingsGlobalCoverState;
    remap: SettingsGlobalRemapState;
};
