import { _projections } from "@/slides";
import type { ProjectionMaster, ProjectionTransition } from "@/types";
import type { Variant, Variants } from "motion/react";
import { create } from "zustand";

// Record<number, Record<number, number>> -> Record<projectionIndex, Record<contentIndex, transitionIndex>>
type TransitionsMap = Record<number, Record<number, number>>;
// ProjectionTransition[] -> Store all used transitions into a set
interface TransitionState {
    transitions: ProjectionTransition[];
    maps: TransitionsMap;
}

interface TransitionActions {
    getTransition: (
        projectionIndex: number,
        contentIndex: number,
    ) => ProjectionTransition;
}

type TransitionStore = TransitionState & TransitionActions;

const transitionMiner = (projections: ProjectionMaster[]): TransitionState => {
    const transitions: ProjectionTransition[] = [];
    const transitionsMap: TransitionsMap = {};

    for (let i = 0; i < projections.length; i++) {
        const projection = projections[i]!;
        const t = projection.transition ?? "none";

        if (!transitions.includes(t)) {
            transitions.push(t);
        }

        for (let j = 0; j < projection.contents.length; j++) {
            const content = projection.contents[j]!;

            transitionsMap[i] ??= {} as TransitionsMap[number];
            transitionsMap[i]![j] = transitions.indexOf(
                content.transition ?? t,
            );
        }
    }

    return { transitions, maps: transitionsMap };
};

export const useTransitionStore = create<TransitionStore>((_, get) => ({
    ...transitionMiner(_projections),

    getTransition(projectionIndex: number, contentIndex: number) {
        return (
            get().transitions[
                get().maps[projectionIndex]?.[contentIndex] ?? 0
            ] ?? "none"
        );
    },
}));

const enterExit: Variant = (type: ProjectionTransition) => {
    switch (type) {
        case "fade":
            return {
                opacity: 0,
                transition: { duration: 1 },
            };
        case "none":
        default:
            return {
                opacity: 1,
                transition: { duration: 0 },
            };
    }
};
// Motion variants
export const transitionVariants: Variants = {
    enter: enterExit,
    center: {
        opacity: 1,
        transition: { duration: 1 },
    },
    exit: enterExit,
};
