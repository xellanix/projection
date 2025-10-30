import { _projections } from "@/slides";
import type {
    ProjectionBackgroundsMap,
    ProjectionMaster,
    ProjectionMasterWithId,
} from "@/types";
import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";

type Setter<T> = React.SetStateAction<T>;

type ProjectionBackgrounds = {
    backgrounds: string[];
    maps: ProjectionBackgroundsMap;
};

interface ProjectionState {
    projections: ProjectionMasterWithId[];
    backgrounds: string[];
    maps: ProjectionBackgroundsMap;
}

interface ProjectionActions {
    getProjectionLength: (projectionIndex: number) => number;
    getBackground: (
        projectionIndex: number,
        contentIndex: number,
    ) => [string, number];
    getContents: (projectionIndex: number) => ProjectionMaster["contents"];

    setProjections: (projections: Setter<ProjectionMaster[]>) => void;
    setProjectionsWithIds: (
        projections: Setter<ProjectionMasterWithId[]>,
    ) => void;
}

type ProjectionStore = ProjectionState & ProjectionActions;

const backgroundMiner = (
    projections: ProjectionMaster[],
): ProjectionBackgrounds => {
    const backgrounds: string[] = [];
    const backgroundsMap: ProjectionBackgroundsMap = {};

    for (let i = 0; i < projections.length; i++) {
        const projection = projections[i]!;
        const bg = projection.bg;

        if (!backgrounds.includes(bg)) {
            backgrounds.push(bg);
        }

        for (let j = 0; j < projection.contents.length; j++) {
            const content = projection.contents[j]!;

            backgroundsMap[i] ??= {} as ProjectionBackgroundsMap[number];
            backgroundsMap[i]![j] = backgrounds.indexOf(content.bg ?? bg);
        }
    }

    return { backgrounds, maps: backgroundsMap };
};

const generateIds = (projections: ProjectionMaster[]) => {
    return projections.map<ProjectionMasterWithId>((p) => ({
        ...p,
        id: uuidv4(),
    }));
};

export const useProjectionStore = create<ProjectionStore>((set, get) => ({
    ...backgroundMiner(_projections),
    projections: generateIds(_projections),

    getProjectionLength: (projectionIndex: number) =>
        get().projections[projectionIndex]?.contents.length ?? 0,

    getBackground: (projectionIndex: number, contentIndex: number) => {
        const bgIndex = get().maps[projectionIndex]?.[contentIndex] ?? 0;
        return [get().backgrounds[bgIndex] ?? "", bgIndex];
    },

    getContents: (projectionIndex: number) =>
        get().projections[projectionIndex]?.contents ?? [],

    setProjections: (projections) => {
        set((s) => {
            const p =
                typeof projections === "function"
                    ? projections(s.projections)
                    : projections;
            return {
                ...backgroundMiner(p),
                projections: generateIds(p),
            };
        });
    },

    setProjectionsWithIds: (projections) => {
        set((s) => {
            const p =
                typeof projections === "function"
                    ? projections(s.projections)
                    : projections;
            return {
                ...backgroundMiner(p),
                projections: p,
            };
        });
    },
}));
