import type { AppSettings } from "@/types/settings";
import { v4 as uuidv4 } from "uuid";

export const defaultSettings: AppSettings = {
    __internal: {
        id: uuidv4(),
    },
    remap: {
        screenResolution: {
            width: 1920,
            height: 1080,
        },
        contentResolution: {
            width: 1920,
            height: 1080,
        },
        scaleStrategy: "fit",
    },
};
