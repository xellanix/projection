import { useProjectionStore } from "@/stores/projection.store";
import { useSocketStore } from "@/stores/socket.store";
import { createStore, create } from "zustand";

type Setter<T> = React.SetStateAction<T>;
type ReactDispatch<T> = React.Dispatch<Setter<T>>;

interface BaseControlState {
    currentProjection: number;
    currentIndex: number;
}

interface ControlState extends BaseControlState {
    maxProjection: number;
    maxIndex: number;
}

interface BaseControlActions {
    setCurrentIndex: ReactDispatch<number>;
    setCurrentProjection: ReactDispatch<number>;
    setCurrent: (projection: Setter<number>, index: Setter<number>) => void;
}

interface ControlActions extends BaseControlActions {
    setMaxIndex: (index: number) => void;
    setMaxProjection: (index: number) => void;

    initMaxIndex: () => void;
    initMaxProjection: () => void;

    incrementIndex: () => void;
    incrementProjection: () => void;

    decrementIndex: () => void;
    decrementProjection: () => void;

    moveIndex: (delta: number) => () => void;
    moveProjection: (delta: number) => () => void;

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

        setCurrentIndex: (i: Setter<number>) =>
            set((s) => ({
                currentIndex: _setIndex(i, s.currentIndex, s.maxIndex),
            })),
        setCurrentProjection: (i: Setter<number>) =>
            set((s) => {
                const final = _setProjection(i, s);
                return {
                    currentProjection: final,
                    maxIndex:
                        useProjectionStore
                            .getState()
                            .getProjectionLength(final) - 1,
                };
            }),
        setCurrent: (projection: Setter<number>, index: Setter<number>) =>
            set((s) => {
                const currentProjection = _setProjection(projection, s);
                const maxIndex = _maxIndex(currentProjection);
                return {
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

        incrementIndex: () =>
            set((s) => ({
                currentIndex: loop(s.currentIndex + 1, s.maxIndex),
            })),
        incrementProjection: () =>
            set((s) => ({
                currentProjection: loop(
                    s.currentProjection + 1,
                    s.maxProjection,
                ),
            })),

        decrementIndex: () =>
            set((s) => ({
                currentIndex: loop(s.currentIndex - 1, s.maxIndex),
            })),
        decrementProjection: () =>
            set((s) => ({
                currentProjection: loop(
                    s.currentProjection - 1,
                    s.maxProjection,
                ),
            })),

        moveIndex: (delta: number) => () =>
            set((s) => ({
                currentIndex: loop(s.currentIndex + delta, s.maxIndex),
            })),
        moveProjection: (delta: number) => () =>
            set((s) => ({
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
