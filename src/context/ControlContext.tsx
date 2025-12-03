"use client";

import {
    createControlStore,
    useSidebarControl,
    type ControlStore,
} from "@/stores/control.store";
import React, {
    createContext,
    useContext,
    useEffect,
    useRef,
    type ReactNode,
} from "react";
import { useStore } from "zustand";
import { useShallow } from "zustand/react/shallow";

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

export const SidebarControlSync = () => {
    const [currentProjection, currentIndex] = useSidebarControl(
        useShallow((s) => [s.currentProjection, s.currentIndex]),
    );
    const [setCurrentProjection, setCurrentIndex] = useControl(
        useShallow((s) => [s.setCurrentProjection, s.setCurrentIndex]),
    );

    useEffect(() => {
        setCurrentProjection(currentProjection);
        setCurrentIndex(currentIndex);
    }, [
        currentIndex,
        setCurrentIndex,
        currentProjection,
        setCurrentProjection,
    ]);

    return null;
};
