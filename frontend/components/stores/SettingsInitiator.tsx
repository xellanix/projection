import { useSettingsStore } from "@/stores/settings.store";
import { useSocketStore } from "@/stores/socket.store";
import type { AppSettings } from "@/types/settings";
import { memo, useEffect } from "react";

function SettingsInitiatorR() {
    const set = useSettingsStore((s) => s.set);
    const socket = useSocketStore(({ socket }) => socket);

    useEffect(() => {
        if (!socket) return;

        const update = (_settings: AppSettings) => {
            set((s) => {
                s.global = _settings;
                s.globalActivator = "server";
                Object.assign(s.temp, s.global);
            });
        };

        socket.emit("client:settings:init");
        socket.on("server:settings:init", update);

        return () => {
            socket.off("server:settings:init", update);
        };
    }, [set, socket]);

    return null;
}

export const SettingsInitiator = memo(SettingsInitiatorR);
