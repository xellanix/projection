import { create } from "zustand";

interface GroupState {
    groupIndices: number[];
}

interface GroupActions {
    getIndex: (group?: number, item?: number) => number;
    init: (indices: number[]) => void;
    addIndex: (index: number) => void;
    reset: () => void;
}

type GroupStore = GroupState & GroupActions;

export const useGroupStore = create<GroupStore>((set, get) => ({
    groupIndices: [],

    getIndex: (group, item) => {
        if (group !== undefined) return get().groupIndices[group - 1] ?? 0;
        else if (item !== undefined) return item - 1;
        else return -1;
    },

    init: (indices) => set({ groupIndices: indices }),

    addIndex: (index: number) =>
        set((s) => ({ groupIndices: [...s.groupIndices, index] })),

    reset: () => set({ groupIndices: [] }),
}));
