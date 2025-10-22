"use client";

import { createContext, useContext, useRef } from "react";

interface ViewOnly {
    isViewOnly: boolean;
}

const ViewOnlyContext = createContext<ViewOnly>({
    isViewOnly: false,
});

export const useViewOnly = () => useContext(ViewOnlyContext);

export function ViewOnlyProvider({ children }: { children: React.ReactNode }) {
    const preview = useRef<ViewOnly>({ isViewOnly: true });

    return (
        <ViewOnlyContext.Provider value={preview.current}>
            {children}
        </ViewOnlyContext.Provider>
    );
}
