"use client";

import { _projections } from "@/slides";
import type { ProjectionBackgroundsMap, ProjectionMaster } from "@/types";
import { createContext, useContext, useRef } from "react";

type ProjectionBackgrounds = [string[], ProjectionBackgroundsMap];

const ProjectionContext = createContext<ProjectionMaster[]>([]);
const BackgroundsContext = createContext<ProjectionBackgrounds>([[], {}]);

export const useProjection = () => useContext(ProjectionContext);
export const useBackgrounds = () => useContext(BackgroundsContext);
export const useProjectionLength = (projectionIndex: number) => {
    return _projections[projectionIndex]?.contents.length ?? 0;
}

const backgroundMiner = (projections: ProjectionMaster[]): ProjectionBackgrounds => {
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

    return [backgrounds, backgroundsMap];
};

export const ProjectionProvider = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    const projections = useRef<ProjectionMaster[]>(_projections);
    const backgrounds = useRef(backgroundMiner(projections.current));

    return (
        <ProjectionContext.Provider value={projections.current}>
            <BackgroundsContext.Provider value={backgrounds.current}>
                {children}
            </BackgroundsContext.Provider>
        </ProjectionContext.Provider>
    );
};
