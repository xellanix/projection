"use client";

import { createContext, useContext, useRef } from "react";

interface Preview {
    isPreview: boolean;
}

const PreviewContext = createContext<Preview>({
    isPreview: false,
});

export const usePreview = () => useContext(PreviewContext);

export function PreviewProvider({ children }: { children: React.ReactNode }) {
    const preview = useRef<Preview>({ isPreview: true });

    return (
        <PreviewContext.Provider value={preview.current}>
            {children}
        </PreviewContext.Provider>
    );
}
