"use client";

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useRef,
} from "react";

type Shortcuts = Record<string, () => void>;

const GlobalKeyboardContext = createContext<
    [
        (key: keyof Shortcuts, callback: () => void) => void,
        (key: keyof Shortcuts) => void,
    ]
>([
    () => {
        /* */
    },
    () => {
        /* */
    },
]);

export const useGlobalKeyboard = () => {
    return useContext(GlobalKeyboardContext);
};

export const GlobalKeyboardProvider = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    const shortcuts = useRef<Shortcuts>({});

    const registerShortcut = useCallback(
        (key: keyof Shortcuts, callback: () => void) => {
            shortcuts.current[key] = callback;
        },
        [],
    );

    const unregisterShortcut = useCallback((key: keyof Shortcuts) => {
        delete shortcuts.current[key];
    }, []);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const active = document.activeElement as HTMLElement | null;
            const focusedTag = active?.tagName ?? "";
            const isTextField =
                focusedTag === "INPUT" ||
                focusedTag === "TEXTAREA" ||
                active?.getAttribute("contenteditable") === "true";

            if (document.body.dataset["scrollLocked"] === "1") return;
            if (isTextField) return; // Allow native behavior

            if (e.ctrlKey || e.metaKey || e.altKey) return;

            if (e.repeat) return;

            switch (e.code) {
                case "KeyB": {
                    if (e.shiftKey) return;

                    e.preventDefault();
                    shortcuts.current["B"]?.();
                    break;
                }
                case "KeyC": {
                    if (e.shiftKey) return;

                    e.preventDefault();
                    shortcuts.current["C"]?.();
                    break;
                }
                case "KeyF": {
                    if (!e.shiftKey) return;

                    e.preventDefault();
                    shortcuts.current["Shift+F"]?.();
                    break;
                }
                case "KeyM": {
                    if (!e.shiftKey) return;

                    e.preventDefault();
                    shortcuts.current["Shift+M"]?.();
                    break;
                }
                case "KeyT": {
                    if (e.shiftKey) return;

                    e.preventDefault();
                    shortcuts.current["T"]?.();
                    break;
                }
                case "KeyV": {
                    if (e.shiftKey) return;

                    e.preventDefault();
                    shortcuts.current["V"]?.();
                    break;
                }
                case "ArrowLeft": {
                    e.preventDefault();

                    if (e.shiftKey) shortcuts.current["Shift+ArrowLeft"]?.();
                    else shortcuts.current["ArrowLeft"]?.();

                    break;
                }
                case "ArrowRight": {
                    e.preventDefault();

                    if (e.shiftKey) shortcuts.current["Shift+ArrowRight"]?.();
                    else shortcuts.current["ArrowRight"]?.();

                    break;
                }
                case "ArrowUp": {
                    if (e.shiftKey) return;

                    e.preventDefault();
                    shortcuts.current["ArrowUp"]?.();
                    break;
                }
                case "ArrowDown": {
                    if (e.shiftKey) return;

                    e.preventDefault();
                    shortcuts.current["ArrowDown"]?.();
                    break;
                }
                case "Digit0":
                case "Digit1":
                case "Digit2":
                case "Digit3":
                case "Digit4":
                case "Digit5":
                case "Digit6":
                case "Digit7":
                case "Digit8":
                case "Digit9":
                case "Numpad0":
                case "Numpad1":
                case "Numpad2":
                case "Numpad3":
                case "Numpad4":
                case "Numpad5":
                case "Numpad6":
                case "Numpad7":
                case "Numpad8":
                case "Numpad9": {
                    e.preventDefault();

                    if (e.shiftKey) shortcuts.current["Shift+" + e.code]?.();
                    else shortcuts.current[e.code]?.();

                    break;
                }
                case "Enter": {
                    e.preventDefault();

                    if (e.shiftKey) shortcuts.current["Shift+Enter"]?.();
                    else shortcuts.current["Enter"]?.();
                    
                    break;
                }
                default:
                    break;
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    return (
        <GlobalKeyboardContext.Provider
            value={[registerShortcut, unregisterShortcut]}
        >
            {children}
        </GlobalKeyboardContext.Provider>
    );
};
