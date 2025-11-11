import { _projections } from "@/data/__temp/slides";
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
        return contentIndex < 0
            ? "fade"
            : (get().transitions[
                  get().maps[projectionIndex]?.[contentIndex] ?? 0
              ] ?? "none");
    },
}));

// Motion variants
const variants = (duration: number): Variants => {
    const enterExit: Variant = (type: ProjectionTransition) => {
        switch (type) {
            case "fade":
                return {
                    opacity: 0,
                    transition: { duration },
                };
            case "none":
            default:
                return {
                    opacity: 1,
                    transition: { duration: 0 },
                };
        }
    };

    return {
        enter: enterExit,
        center: {
            opacity: 1,
            transition: { duration },
        },
        exit: enterExit,
    };
};
const transitionDuration = 0.3;
export const transitionVariants = variants(transitionDuration);
export const bgTransitionVariants = variants(Math.max(transitionDuration, 1));
