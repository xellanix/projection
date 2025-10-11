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

            if (isTextField) return; // Allow native behavior

            if (e.ctrlKey || e.metaKey || e.altKey) return;

            switch (e.code) {
                case "KeyB": {
                    if (!e.shiftKey) return;

                    e.preventDefault();
                    shortcuts.current["Shift+B"]?.();
                    break;
                }
                case "KeyC": {
                    if (!e.shiftKey) return;

                    e.preventDefault();
                    shortcuts.current["Shift+C"]?.();
                    break;
                }
                case "KeyF": {
                    if (!e.shiftKey) return;

                    e.preventDefault();
                    shortcuts.current["Shift+F"]?.();
                    break;
                }
                case "ArrowLeft": {
                    e.preventDefault();
                    
                    if (e.shiftKey)
                        shortcuts.current["Shift+ArrowLeft"]?.();
                    else shortcuts.current["ArrowLeft"]?.();

                    break;
                }
                case "ArrowRight": {
                    e.preventDefault();
                    
                    if (e.shiftKey)
                        shortcuts.current["Shift+ArrowRight"]?.();
                    else shortcuts.current["ArrowRight"]?.();

                    break;
                }
                case "Enter": {
                    e.preventDefault();
                    shortcuts.current["Enter"]?.();
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
