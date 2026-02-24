import { _projections } from "@/data/__temp/slides";
import type {
    ProjectionBackgroundsMap,
    ProjectionMaster,
    ProjectionMasterWithId,
} from "@/types";
import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import { useTransitionStore } from "@/stores/transition.store";

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

    addProjection: (projection: ProjectionMaster) => void;
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

        const bgIndex = backgrounds.indexOf(bg);
        for (let j = 0; j < projection.contents.length; j++) {
            const content = projection.contents[j]!;
            const contentBg = content.bg;

            if (contentBg && !backgrounds.includes(contentBg)) {
                backgrounds.push(contentBg);
            }

            backgroundsMap[i] ??= {} as ProjectionBackgroundsMap[number];
            backgroundsMap[i]![j] = contentBg
                ? backgrounds.indexOf(contentBg)
                : bgIndex;
        }
    }

    return { backgrounds, maps: backgroundsMap };
};

export const generateId = (projection: ProjectionMaster) => {
    return {
        ...projection,
        id: uuidv4(),
    } as ProjectionMasterWithId;
};

const generateIds = (projections: ProjectionMaster[]) => {
    return projections.map<ProjectionMasterWithId>(generateId);
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

            useTransitionStore.getState().syncWithProjections(p);
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

            useTransitionStore.getState().syncWithProjections(p);
            return {
                ...backgroundMiner(p),
                projections: p,
            };
        });
    },

    addProjection: (projection) => {
        set((s) => {
            const p = [...s.projections, { ...projection, id: uuidv4() }];
            useTransitionStore.getState().syncWithProjections(p);
            return {
                ...backgroundMiner(p),
                projections: p,
            };
        });
    },
}));
