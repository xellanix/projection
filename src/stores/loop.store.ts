import { _projections } from "@/data/__temp/slides";
import { compareArrays } from "@/lib/utils";
import { useGroupStore } from "@/stores/group.store";
import type { ProjectionLoopQueue, ProjectionMaster } from "@/types";
import { create } from "zustand";

type Activator = "client" | "server" | (string & {});

interface LoopState {
    activator: Activator;
    queue: ProjectionLoopQueue[];
    queueIndex: number;
}

interface LoopActions {
    getCurrentQueue: (start?: number) => ProjectionLoopQueue;
    getNextQueue: (start?: number) => ProjectionLoopQueue;

    setQueueIndex: (index: number, activator?: Activator) => void;

    syncNextQueueContent: (start?: number) => number;
    syncWithProjection: (projection?: ProjectionMaster) => void;
    moveIndex: (delta: number, start?: number) => void;
    moveNext: (start?: number) => void;
    resetQueueIndex: (activator?: Activator) => void;
}

type LoopStore = LoopState & LoopActions;

const queueFromProjection = (p?: ProjectionMaster): ProjectionLoopQueue[] => {
    return p?.loopQueue ?? [];
};

const nextQueueData = {
    index: -1,
    content: 1,
};
export const useLoopStore = create<LoopStore>((set, get) => ({
    activator: "client",
    /* queue: [
        { group: 2 },
        { group: 3 },
        { group: 3 },
        { group: 4 },
        { group: 5 },
        { group: 2 },
        { group: 3 },
        { item: 7 },
        { group: 4 },
        { group: 5 },
        { group: 2 },
        { group: 7 },
        { group: 7 },
        { group: 7 },
        { group: 4 },
        { group: 5 },
        { item: 20 },
    ], */
    queue: queueFromProjection(_projections[0]),
    queueIndex: -1,

    getCurrentQueue: (start) => get().queue[start ?? get().queueIndex] ?? {},
    getNextQueue: (start) => get().queue[(start ?? get().queueIndex) + 1] ?? {},

    setQueueIndex: (index, activator = "client") => {
        set({ activator, queueIndex: index });
        get().syncNextQueueContent(index);
    },

    syncNextQueueContent: (start) => {
        const queueLength = get().queue.length;
        if (queueLength === 0) return -1;

        const queueIndex = get().queueIndex;
        if (nextQueueData.index === queueIndex && nextQueueData.content !== -1)
            return nextQueueData.content;

        if (queueIndex + 1 === queueLength) return -1;

        const normStart = start ?? queueIndex;
        const { group, item } = get().getNextQueue(normStart);

        if (normStart !== -1) {
            const old = get().queue[normStart] ?? {};
            if (group === old.group && item === old.item) {
                nextQueueData.index = normStart;
                return nextQueueData.content;
            }
        }

        const content = useGroupStore.getState().getIndex(group, item);
        if (content !== nextQueueData.content) {
            nextQueueData.index = normStart;
            nextQueueData.content = content;
        }

        return content;
    },
    syncWithProjection: (projection) => {
        const queue = queueFromProjection(projection);
        if (
            compareArrays(
                queue,
                get().queue,
                (a, b) => a.group === b.group && a.item === b.item,
            )
        )
            return;

        set({ queue });
    },
    moveIndex: (delta, start) => {
        const queueLength = get().queue.length;
        const moved = (start ?? get().queueIndex) + delta;
        if (moved < -1 || moved >= queueLength) return;
        get().setQueueIndex(moved);
    },
    moveNext: (start) => get().moveIndex(1, start),
    resetQueueIndex: (activator = "client") =>
        set({ activator, queueIndex: -1 }),
}));
