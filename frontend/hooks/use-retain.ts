import { useRef, useEffect, useMemo } from "react";

/**
 * useRetain
 *
 * A hook that holds onto the last valid value returned by the factory function.
 * If the factory returns `undefined`, the hook ignores the update and returns the
 * previous valid value (or the initial value).
 *
 * This is useful for preventing UI flickering during invalid states, loading,
 * or error conditions.
 *
 * @template T - The type of the value to be retained.
 *
 * @param {() => T | undefined} factory A function that returns the new value, or `undefined` to discard the update.
 * @param {React.DependencyList} deps The dependency array that triggers the factory to re-run.
 * @param {T} [initialValue] Default value to use before the first valid calculation.
 * @returns {T} The current value (if valid), the last known valid value, or the initial value.
 */

// Overload 1: With initialValue (Guaranteed T return)
// Allows for safe inline destructuring (e.g., const { x, y } = useRetain(...))
export function useRetain<T>(
    factory: () => T | undefined,
    deps: React.DependencyList,
    initialValue: T,
): T;

/**
 * useRetain
 *
 * A hook that holds onto the last valid value returned by the factory function.
 * If the factory returns `undefined`, the hook ignores the update and returns the
 * previous valid value (or `undefined`).
 *
 * This is useful for preventing UI flickering during invalid states, loading,
 * or error conditions.
 *
 * @template T - The type of the value to be retained.
 *
 * @param {() => T | undefined} factory A function that returns the new value, or `undefined` to discard the update.
 * @param {React.DependencyList} deps The dependency array that triggers the factory to re-run.
 * @returns {T | undefined} The current value (if valid), the last known valid value, or `undefined`.
 */

// Overload 2: Without initialValue (Returns T | undefined)
// The value might be undefined on the first render if the factory returns undefined.
export function useRetain<T>(
    factory: () => T | undefined,
    deps: React.DependencyList,
): T | undefined;

// Implementation
export function useRetain<T>(
    factory: () => T | undefined,
    deps: React.DependencyList,
    initialValue?: T,
): T | undefined {
    // Calculate the candidate value
    // If the factory returns undefined, it signals "Do not update".
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const candidate = useMemo(factory, deps);

    // The Cache (Holds the last non-undefined value)
    // We initialize it with the provided initialValue (if any).
    const lastValidRef = useRef<T | undefined>(initialValue);

    // Commit Phase: Update the cache if we have a valid candidate
    useEffect(() => {
        if (candidate !== undefined) {
            lastValidRef.current = candidate;
        }
    }, [candidate]);

    // Return Logic
    // Priority: New Valid Candidate > Old Cached Value > Initial Value (if provided)
    return candidate ?? lastValidRef.current;
}
