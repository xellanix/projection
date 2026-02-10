"use client";

import {
    createControlStore,
    useSidebarControl,
    type ControlStore,
} from "@/stores/control.store";
import { useProjectionStore } from "@/stores/projection.store";
import {
    createContext,
    useContext,
    useEffect,
    useState,
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
    const [store] = useState<ControlStoreApi>(() => createControlStore());

    return (
        <ControlContext.Provider value={store}>
            {children}
        </ControlContext.Provider>
    );
};

export const useControl = <T,>(selector: (store: ControlStore) => T): T => {
    const store = useContext(ControlContext);

    if (!store) {
        throw new Error("useControl must be used within a ControlProvider");
    }

    return useStore(store, selector);
};
export const useControlApi = (): ControlStoreApi => {
    const store = useContext(ControlContext);

    if (!store) {
        throw new Error("useControlApi must be used within a ControlProvider");
    }

    return store;
};

export const SidebarControlSync = () => {
    const [setCurrentProjection, setCurrentIndex] = useControl(
        useShallow((s) => [s.setCurrentProjection, s.setCurrentIndex]),
    );

    useEffect(() => {
        useSidebarControl.subscribe((s, prev) => {
            if (s.currentProjection !== prev.currentProjection) {
                setCurrentProjection(s.currentProjection);
                setCurrentIndex(s.currentIndex);
            }
            if (s.currentIndex !== prev.currentIndex) {
                setCurrentIndex(s.currentIndex);
            }
        });
    }, [setCurrentIndex, setCurrentProjection]);

    return null;
};

export const MaxProjectionSync = () => {
    const setMaxProjection = useControl((s) => s.setMaxProjection);

    useEffect(() => {
        const unsub = useProjectionStore.subscribe((s, prev) => {
            const current = s.projections.length;
            if (current !== prev.projections.length) {
                setMaxProjection(current - 1);
            }
        });

        return unsub;
    }, [setMaxProjection]);

    return null;
};
