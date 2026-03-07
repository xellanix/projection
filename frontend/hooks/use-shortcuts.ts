import { useEffect, useRef } from "react";
import { useShortcutsStore, getAcceleratorHash } from "@/stores/shortcuts.store";
import type { Accelerator } from "@/types";

export const GlobalKeyboardListener = () => {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const state = useShortcutsStore.getState();

            if (state.isPaused) return;
            if (document.body.dataset["scrollLocked"] === "1") return;
            if (document.body) if (e.repeat) return;

            // Normalize base key to match the Accelerator's expected key string
            let mainKey = e.code;
            if (mainKey.startsWith("Key")) {
                mainKey = mainKey.replace("Key", "");
            } else if (mainKey.startsWith("Digit")) {
                mainKey = mainKey.replace("Digit", "");
            } else if (mainKey.startsWith("Numpad")) {
                mainKey = mainKey.replace("Numpad", "");
                // Handle Numpad specific symbols
                if (mainKey === "Add") mainKey = "+";
                else if (mainKey === "Subtract") mainKey = "-";
                else if (mainKey === "Multiply") mainKey = "*";
                else if (mainKey === "Divide") mainKey = "/";
                else if (mainKey === "Decimal") mainKey = ".";
            }

            const eventHash = getAcceleratorHash({
                ctrl: e.ctrlKey,
                meta: e.metaKey,
                alt: e.altKey,
                shift: e.shiftKey,
                key: mainKey,
            });

            const action = state.shortcuts[eventHash];
            if (!action) return;

            const active = document.activeElement as HTMLElement | null;
            const focusedTag = active?.tagName ?? "";
            const isTextField =
                focusedTag === "INPUT" ||
                focusedTag === "TEXTAREA" ||
                active?.getAttribute("contenteditable") === "true";
            if (isTextField) return;

            e.preventDefault();
            action();
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    return null;
};

export const useShortcut = (accelerator?: Accelerator, callback?: () => void) => {
    const callbackRef = useRef(callback);
    useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    const accelHash = accelerator ? getAcceleratorHash(accelerator) : null;
    const hasCallback = !!callback;

    useEffect(() => {
        if (!accelHash || !accelerator || !hasCallback) return;

        const handler = () => callbackRef.current?.();
        useShortcutsStore.getState().registerShortcut(accelerator, handler);

        return () => useShortcutsStore.getState().unregisterShortcut(accelerator);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [accelHash, hasCallback]);
};
