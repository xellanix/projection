import { useState, useEffect } from "react";

export function useBreakpointHandler(
    media: string,
    handler: (trigger: boolean) => void,
) {
    const mql = window.matchMedia(media);
    const onChange = (ev: MediaQueryListEvent) => {
        handler(ev.matches);
    };
    mql.addEventListener("change", onChange);
    handler(mql.matches);
    return () => mql.removeEventListener("change", onChange);
}

export function useBreakpoint(maxWidth: number) {
    const [isMobile, setIsMobile] = useState<boolean | undefined>(undefined);

    useEffect(() => {
        return useBreakpointHandler(
            `(max-width: ${maxWidth - 1}px)`,
            setIsMobile,
        );
    }, []);

    return !!isMobile;
}
