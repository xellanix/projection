"use client";

import { createContext, useContext } from "react";

interface ViewOnly {
    isViewOnly: boolean;
}

const ViewOnlyContext = createContext<ViewOnly>({
    isViewOnly: false,
});

export const useViewOnly = () => useContext(ViewOnlyContext);

const viewOnly: ViewOnly = {
    isViewOnly: true,
}
export function ViewOnlyProvider({ children }: { children: React.ReactNode }) {
    return (
        <ViewOnlyContext.Provider value={viewOnly}>
            {children}
        </ViewOnlyContext.Provider>
    );
}
