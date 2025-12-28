import { useProjectionStore } from "@/stores/projection.store";
import { useSocketStore } from "@/stores/socket.store";
import { createStore, create } from "zustand";

type Activator = "client" | "server";

type Setter<T> = React.SetStateAction<T>;
type Dispatcher<T> = (value: Setter<T>, activator?: Activator) => void;

interface BaseControlState {
    currentProjection: number;
    currentIndex: number;
}

interface ControlState extends BaseControlState {
    activator: Activator;
    maxProjection: number;
    maxIndex: number;
}

interface BaseControlActions {
    setCurrentIndex: Dispatcher<number>;
    setCurrentProjection: Dispatcher<number>;
    setCurrent: (
        projection: Setter<number>,
        index: Setter<number>,
        activator?: Activator,
    ) => void;
}

interface ControlActions extends BaseControlActions {
    setMaxIndex: (index: number) => void;
    setMaxProjection: (index: number) => void;

    initMaxIndex: () => void;
    initMaxProjection: () => void;

    incrementIndex: (activator?: Activator) => void;
    incrementProjection: (activator?: Activator) => void;

    decrementIndex: (activator?: Activator) => void;
    decrementProjection: (activator?: Activator) => void;

    moveIndex: (delta: number, activator?: Activator) => () => void;
    moveProjection: (delta: number, activator?: Activator) => () => void;

    emit: <T extends [unknown, ...unknown[]]>(
        event: string,
        args: (store: ControlStore) => [...T],
    ) => void;
}

export type BaseControlStore = BaseControlState & BaseControlActions;
export type ControlStore = ControlState & ControlActions;

const loop = (value: number, max: number) => {
    if (value < 0) return max;
    if (value > max) return 0;
    return value;
};

const _setIndex = (i: Setter<number>, ci: number, m: number) =>
    loop(typeof i === "function" ? i(ci) : i, m);
const _setProjection = (i: Setter<number>, s: ControlStore) =>
    loop(typeof i === "function" ? i(s.currentProjection) : i, s.maxProjection);
const _maxIndex = (cp: number) =>
    useProjectionStore.getState().getProjectionLength(cp) - 1;

export const createControlStore = () =>
    createStore<ControlStore>((set, get) => ({
        currentProjection: 0,
        currentIndex: 0,
        maxProjection: useProjectionStore.getState().projections.length - 1,
        maxIndex: 0,
        activator: "client",

        setCurrentIndex: (i: Setter<number>, activator: Activator = "client") =>
            set((s) => ({
                activator,
                currentIndex: _setIndex(i, s.currentIndex, s.maxIndex),
            })),
        setCurrentProjection: (
            i: Setter<number>,
            activator: Activator = "client",
        ) =>
            set((s) => {
                const final = _setProjection(i, s);
                return {
                    activator,
                    currentProjection: final,
                    maxIndex:
                        useProjectionStore
                            .getState()
                            .getProjectionLength(final) - 1,
                };
            }),
        setCurrent: (
            projection: Setter<number>,
            index: Setter<number>,
            activator: Activator = "client",
        ) =>
            set((s) => {
                const currentProjection = _setProjection(projection, s);
                const maxIndex = _maxIndex(currentProjection);
                return {
                    activator,
                    currentIndex: _setIndex(index, s.currentIndex, maxIndex),
                    currentProjection,
                    maxIndex,
                };
            }),
        setMaxIndex: (i: number) => set({ maxIndex: i }),
        setMaxProjection: (i: number) => set({ maxProjection: i }),
        initMaxIndex: () =>
            set((s) => ({
                maxIndex: _maxIndex(s.currentProjection),
            })),
        initMaxProjection: () =>
            set({
                maxProjection:
                    useProjectionStore.getState().projections.length - 1,
            }),

        incrementIndex: (activator: Activator = "client") =>
            set((s) => ({
                activator,
                currentIndex: loop(s.currentIndex + 1, s.maxIndex),
            })),
        incrementProjection: (activator: Activator = "client") =>
            set((s) => ({
                activator,
                currentProjection: loop(
                    s.currentProjection + 1,
                    s.maxProjection,
                ),
            })),

        decrementIndex: (activator: Activator = "client") =>
            set((s) => ({
                activator,
                currentIndex: loop(s.currentIndex - 1, s.maxIndex),
            })),
        decrementProjection: (activator: Activator = "client") =>
            set((s) => ({
                activator,
                currentProjection: loop(
                    s.currentProjection - 1,
                    s.maxProjection,
                ),
            })),

        moveIndex:
            (delta: number, activator: Activator = "client") =>
            () =>
                set((s) => ({
                    activator,
                    currentIndex: loop(s.currentIndex + delta, s.maxIndex),
                })),
        moveProjection:
            (delta: number, activator: Activator = "client") =>
            () =>
                set((s) => ({
                    activator,
                    currentProjection: loop(
                        s.currentProjection + delta,
                        s.maxProjection,
                    ),
                })),

        emit: <T extends [unknown, ...unknown[]]>(
            event: string,
            args: (store: ControlStore) => [...T],
        ) => {
            const socket = useSocketStore.getState().socket;
            if (!socket) return;

            socket.emit(event, ...args(get()));
        },
    }));

export const useSidebarControl = create<BaseControlStore>((set) => ({
    currentIndex: 0,
    currentProjection: 0,

    setCurrentIndex: (i: Setter<number>) =>
        set((s) => ({
            currentIndex: typeof i === "function" ? i(s.currentIndex) : i,
        })),
    setCurrentProjection: (i: Setter<number>) =>
        set((s) => {
            const final = typeof i === "function" ? i(s.currentProjection) : i;
            return {
                currentProjection: final,
                maxIndex:
                    useProjectionStore.getState().getProjectionLength(final) -
                    1,
            };
        }),
    setCurrent: (projection: Setter<number>, index: Setter<number>) =>
        set((s) => {
            const currentProjection =
                typeof projection === "function"
                    ? projection(s.currentProjection)
                    : projection;
            const maxIndex = _maxIndex(currentProjection);
            return {
                currentIndex: _setIndex(index, s.currentIndex, maxIndex),
                currentProjection,
                maxIndex,
            };
        }),
}));
