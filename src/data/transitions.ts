import type { ProjectionTransition } from "@/types";
import type { TargetAndTransition } from "motion/react";

/**
 * The default timing (in seconds) used for all projection animations.\
 * This value is typically passed into the animation variant builders
 * within the {@link transitions} object.
 * @type {number}
 * @default 0.3
 */
export const transitionDuration: number = 0.3;

/**
 * A dictionary of animation lifecycle builders mapped by transition type.
 * * Each transition type defines how an element should behave during its
 * mounting (`enter`), active (`center`), and unmounting (`exit`) phases.
 * @remarks
 * * Before trying to use/add a new transition, ensure that the transition
 * type is already defined in the [`TransitionSchema`]{@link (./../schemas/projection.ts)}.
 * * The `exit` property is optional. If a transition type does not define an
 * explicit exit animation, the system is designed to fall back to the
 * `enter` animation as a default trade-off.
 * @type {Record<ProjectionTransition, TransitionVariant>}
 * @example
 * // Accessing a specific transition state
 * const fadeEnter = transitions.fade.enter(transitionDuration);
 */
export const transitions: Record<ProjectionTransition, TransitionVariant> = {
    none: {
        enter: () => ({
            opacity: 0,
            transition: { duration: 0 },
        }),
        center: () => ({
            opacity: 1,
            transition: { duration: 0 },
        }),
    },
    fade: {
        enter: (duration) => ({
            opacity: 0,
            transition: { duration },
        }),
        center: (duration) => ({
            opacity: 1,
            transition: { duration },
        }),
    },
};

/**
 * Defines the animation lifecycle builders for a specific transition type.
 */
type TransitionVariant = {
    /** Function to build the 'initial' entry or 'exit' state. */
    enter: (duration: number) => TargetAndTransition;
    /** Function to build the 'animate' active state. */
    center: (duration: number) => TargetAndTransition;
    /**
     * Function to build the 'exit' state.
     * @note If left undefined, the `variants` factory will default to using {@link TransitionVariant.enter}.
     */
    exit?: (duration: number) => TargetAndTransition;
};
