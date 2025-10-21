"use client";

import { createControlStore, type ControlStore } from "@/stores/control.store";
import React, {
    createContext,
    useContext,
    useRef,
    type ReactNode,
} from "react";
import { useStore } from "zustand";

type ControlStoreApi = ReturnType<typeof createControlStore>;

const ControlContext = createContext<ControlStoreApi | null>(null);

interface ControlProviderProps {
    children: ReactNode;
}
export const ControlProvider = ({ children }: ControlProviderProps) => {
    const storeRef = useRef<ControlStoreApi>(null);

    if (!storeRef.current) {
        storeRef.current = createControlStore();
    }

    return (
        <ControlContext.Provider value={storeRef.current}>
            {children}
        </ControlContext.Provider>
    );
};

export const useControl = <T,>(selector: (store: ControlStore) => T): T => {
    const store = useContext(ControlContext);

    if (!store) {
        throw new Error("useCounter must be used within a CounterProvider");
    }

    return useStore(store, selector);
};
