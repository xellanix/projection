import type { Size } from "@/types";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Modulo that always returns a positive number.
 */
export function mod(n: number, m: number) {
    return ((n % m) + m) % m;
}

/**
 * Finds the Greatest Common Divisor (GCD) using an iterative
 * (non-recursive) Euclidean algorithm.
 */
const gcd = (a: number, b: number): number => {
    while (b !== 0) {
        const temp = b; // Store b
        b = a % b; // New b is the remainder
        a = temp; // New a is the old b
    }
    return a; // When b reaches 0, a is the GCD
};

/**
 * Calculates the simplified aspect ratio from two numbers.
 */
export const getAspectRatio = (width: number | Size, height?: number): Size => {
    let w = 0,
        h = 0;
    if (typeof width === "number") {
        w = width;
        h = height ?? 0;
    } else {
        w = width.width;
        h = width.height;
    }

    if (
        w === 0 ||
        height === 0 ||
        isNaN(w) ||
        isNaN(h) ||
        !isFinite(w) ||
        !isFinite(h)
    ) {
        return { width: 0, height: 0 };
    }

    const divisor = gcd(w, h);

    return {
        width: w / divisor,
        height: h / divisor,
    };
};

/**
 * Mutates a target object by updating its properties with values
 * from a source object, but only for keys that already exist
 * on the target.
 *
 * @param target The object to be mutated.
 * @param source The object to read values from.
 */
export function updateObjectFromSource<T extends object, U extends object>(
    target: T,
    source: U,
): void {
    // Cast to a generic record to satisfy TypeScript's
    // strict type-checking when mixing value types.
    const targetAsRecord = target as Record<string, unknown>;
    const sourceAsRecord = source as Record<string, unknown>;

    // Loop over the keys of the original target object
    for (const key of Object.keys(targetAsRecord)) {
        // Check if the source has this key
        if (Object.hasOwn(sourceAsRecord, key)) {
            // Perform the mutation
            targetAsRecord[key] = sourceAsRecord[key];
        }
    }
}
