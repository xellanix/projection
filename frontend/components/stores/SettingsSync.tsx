import { useViewOnly } from "@/context/ViewOnlyContext";
import { useSettingsStore } from "@/stores/settings.store";
import { useSocketStore } from "@/stores/socket.store";
import type { AppSettings } from "@/types/settings";
import { memo, useEffect } from "react";

export const SettingsSync = memo(function SettingsSync() {
    const set = useSettingsStore((s) => s.set);
    const socket = useSocketStore(({ socket }) => socket);
    const viewOnly = useViewOnly();

    useEffect(() => {
        if (!socket) return;

        const update = (_settings: AppSettings) => {
            set((s) => {
                s.global = _settings;
                s.globalActivator = "server";
                Object.assign(s.temp, s.global);
            });
        };

        socket.on("server:settings:update", update);

        return () => {
            socket.off("server:settings:update", update);
        };
    }, [set, socket]);

    if (!viewOnly.isViewOnly) {
        return <SettingSender />;
    }

    return null;
});

const SettingSender = memo(function SettingSender() {
    const socket = useSocketStore(({ socket }) => socket);

    useEffect(() => {
        const unsubscribe = useSettingsStore.subscribe((s, prev) => {
            if (s.globalActivator === "server" || s.global === prev.global)
                return;
            socket?.emit("client:settings:update", s.global);
        });

        return unsubscribe;
    }, [socket]);

    return null;
});
