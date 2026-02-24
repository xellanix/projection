import React, {
    useRef,
    useLayoutEffect,
    useEffect,
    useState,
    memo,
    forwardRef,
    useImperativeHandle,
} from "react";

// --- Interfaces ---

interface MarqueeProps {
    /**
     * Custom class name for the animating wrapper.
     * @default ""
     */
    className?: string;
    /**
     * The content to be displayed in the marquee.
     */
    children: React.ReactNode;
    /**
     * The speed of the scroll in pixels per second.
     * @default 50
     */
    speed?: number;
    /**
     * The number of times to loop.
     * 'Infinity' for endless looping.
     * '1' for a single run ("space < content < blank").
     * '3' for three loops.
     * @default Infinity
     */
    loop?: number;
    /**
     * The spacing between elements as a factor of the container's width.
     * e.g., 0.25 = 25% of container width.
     * @default 0.25
     */
    spacingFactor?: number;
    /**
     * The delay in milliseconds before the animation starts or between cycles.
     * @default 0
     */
    delay?: number;
    /**
     * Pauses the animation when true.
     * @default false
     */
    pause?: boolean;
    /**
     * Manually controls the progress of the marquee (0 to 1).
     * This will override the 'speed' prop and stop the animation.
     */
    progress?: number;
    /**
     * Callback function that fires *once* when a finite loop completes.
     * Receives the total loop count as an argument.
     */
    onFinish?: (loopCount: number) => void;
}

export interface MarqueeHandle {
    /**
     * Gets the current progress of the marquee animation.
     * @returns {number} A value from 0 to 1.
     */
    getProgress: () => number;

    /**
     * Gets the number of remaining loops, including the current one.
     * @returns {number} The number of remaining loops.
     */
    getRemainingLoops: () => number;
}

/**
 * A performant, WAAPI-driven marquee component with hybrid loop logic
 * to support both infinite loops and specific "space < content < blank" finite loops.
 */
export const Marquee = memo(
    forwardRef<MarqueeHandle, MarqueeProps>(
        (
            {
                className = "",
                children,
                speed = 50,
                loop = Infinity,
                spacingFactor = 0.25,
                delay = 0,
                pause = false,
                progress,
                onFinish,
            },
            ref,
        ) => {
            // --- Refs ---
            /** Ref for the outer container, used for width measurement. */
            const containerRef = useRef<HTMLDivElement>(null);
            /** Ref for the animating wrapper element. */
            const wrapperRef = useRef<HTMLDivElement>(null);
            /** Ref for the first content block, used for width measurement. */
            const contentRef = useRef<HTMLDivElement>(null);
            /** Ref to store the WAAPI Animation object. */
            const animationRef = useRef<Animation | null>(null);

            // --- State ---
            /** Width of a single content block in pixels. */
            const [contentWidth, setContentWidth] = useState(0);
            /** Width of the visible container in pixels. */
            const [containerWidth, setContainerWidth] = useState(0);

            // --- Measurement Effects ---

            /** Measures the width of the content block. */
            useLayoutEffect(() => {
                if (contentRef.current) {
                    const width = contentRef.current.offsetWidth;
                    setContentWidth(width);
                }
            }, [children]); // Re-measure if children or loop strategy changes

            /** Measures the width of the container and observes resizing. */
            useLayoutEffect(() => {
                const container = containerRef.current;
                if (!container) return;

                const measure = () => setContainerWidth(container.offsetWidth);
                measure(); // Initial measure

                const resizeObserver = new ResizeObserver(measure);
                resizeObserver.observe(container);

                return () => resizeObserver.disconnect();
            }, []); // Runs once on mount

            // --- Logic ---

            /**
             * Determines which rendering strategy to use.
             * - true: "two-clone" for loop >= 2 or Infinity. Performant.
             * - false: "long-chain" for loop 0 or 1. Accurate "blank" ending.
             */
            const isInfinite = loop === Infinity;
            const shouldUseTwoCloneRender =
                isInfinite || (!isInfinite && loop >= 2);

            // --- Calculations ---
            /** The calculated spacing in pixels. */
            const spacingInPixels = containerWidth * spacingFactor;
            /** The total width of a single "space + content" block. */
            const singleBlockWidth = contentWidth + spacingInPixels;

            let totalDistance: number;
            let durationMs: number;
            let iterations: number;

            if (shouldUseTwoCloneRender) {
                // "Two-clone" strategy (loop >= 2 or Infinity)
                totalDistance = singleBlockWidth;
                const duration =
                    speed > 0 && totalDistance > 0 ? totalDistance / speed : 0;
                durationMs = duration * 1000;
                iterations = isInfinite ? Infinity : loop;
            } else {
                // "Long-chain" strategy (loop 0 or 1)
                totalDistance = singleBlockWidth * Math.max(0, loop);
                const duration =
                    speed > 0 && totalDistance > 0 ? totalDistance / speed : 0;
                durationMs = duration * 1000;
                iterations = loop > 0 ? 1 : 0;
            }

            // --- Ref to hold dynamic state ---
            /**
             * This ref holds all the values that the imperative handle's
             * functions need to read. This solves the stale closure problem.
             */
            const stateRef = useRef({
                durationMs,
                shouldUseTwoCloneRender,
                delay,
                isInfinite,
                loop,
            });
            // Update the ref on every render
            // eslint-disable-next-line react-hooks/refs
            stateRef.current = {
                durationMs,
                shouldUseTwoCloneRender,
                delay,
                isInfinite,
                loop,
            };

            // --- WAAPI Animation and Event Effect ---
            /**
             * This effect creates, updates, and controls the
             * main Web Animations API animation.
             */
            useEffect(() => {
                const wrapper = wrapperRef.current;
                if (!wrapper || durationMs === 0) return;

                const keyframes: Keyframe[] = [
                    { transform: "translateX(0)" },
                    { transform: `translateX(-${totalDistance}px)` },
                ];

                const options: KeyframeAnimationOptions = {
                    duration: durationMs,
                    delay: delay,
                    iterations: iterations,
                    easing: "linear",
                    fill: "forwards",
                };

                const animation = wrapper.animate(keyframes, options);
                animationRef.current = animation;

                animation.onfinish = () => {
                    if (!isInfinite) {
                        // If it's a finite loop, call onFinish
                        if (onFinish) {
                            // <-- Use onFinish
                            if (loop > 0) onFinish(loop); // <-- Call onFinish
                        }
                    }
                };

                if (pause) animation.pause();
                if (progress !== undefined) {
                    animation.currentTime = progress * durationMs;
                }

                return () => {
                    // Clear the handler on cleanup
                    animation.onfinish = null;
                    animation.cancel();
                    animationRef.current = null;
                };
            }, [
                totalDistance,
                durationMs,
                iterations,
                delay,
                pause,
                progress,
                isInfinite,
                loop,
                onFinish,
            ]);

            // --- imperative Handle (for getProgress) ---
            /**
             * Exposes the `getProgress` method to the parent component via ref.
             */
            useImperativeHandle(
                ref,
                () => ({
                    /**
                     * Gets the current progress of the animation (0 to 1).
                     */
                    getProgress: () => {
                        // Read from props/state refs to get the latest values
                        const { durationMs, shouldUseTwoCloneRender, delay } =
                            stateRef.current;

                        const animation = animationRef.current;
                        if (!animation || durationMs === 0) return 0;
                        const currentTime =
                            (animation.currentTime as number) || 0;
                        const activeTime = currentTime - delay;

                        if (activeTime <= 0) return 0;

                        if (shouldUseTwoCloneRender) {
                            // Two-clone: progress is % of a single cycle
                            const cycleProgress =
                                (activeTime % durationMs) / durationMs;
                            if (
                                activeTime > 0 &&
                                activeTime % durationMs === 0
                            ) {
                                return 1;
                            }
                            return cycleProgress;
                        } else {
                            // Long-chain: progress is % of total animation
                            return Math.min(1, activeTime / durationMs);
                        }
                    },
                    /**
                     * Gets the number of loops remaining, including the current one.
                     */
                    getRemainingLoops: () => {
                        // Read from props/state refs to get the latest values
                        const {
                            durationMs,
                            shouldUseTwoCloneRender,
                            delay,
                            isInfinite,
                            loop,
                        } = stateRef.current;

                        if (isInfinite) {
                            return Infinity;
                        }

                        const animation = animationRef.current;
                        if (!animation || durationMs === 0 || loop === 0) {
                            return 0;
                        }

                        if (animation.playState === "finished") {
                            return 0;
                        }

                        const currentTime =
                            (animation.currentTime as number) || 0;
                        const activeTime = currentTime - delay;

                        if (activeTime <= 0) {
                            return loop;
                        }

                        if (shouldUseTwoCloneRender) {
                            const currentLoopNumber =
                                Math.floor(activeTime / durationMs) + 1;
                            const remaining = loop - currentLoopNumber + 1;
                            return Math.max(0, remaining);
                        } else {
                            return 1;
                        }
                    },
                }),
                [],
            );

            // --- Render Logic ---

            /** CSS variables for the container. */
            const containerStyle: React.CSSProperties & Record<string, string> =
                {
                    "--marquee-spacing": `${spacingInPixels}px`,
                };

            /** Dynamic styles for the wrapper. */
            const wrapperStyle: React.CSSProperties = {};

            if (progress !== undefined) {
                wrapperStyle.transform = `translateX(-${
                    totalDistance * progress
                }px)`;
            }

            /**
             * Render 2 copies for the "two-clone" strategy,
             * or (loop + 1) copies for the "long-chain" strategy.
             */
            const copiesToRender = shouldUseTwoCloneRender
                ? 2
                : Math.max(1, Math.ceil(loop + 1));

            return (
                <div
                    ref={containerRef}
                    className="w-full overflow-hidden"
                    style={containerStyle}
                >
                    <div
                        ref={wrapperRef}
                        style={wrapperStyle}
                        className={`flex w-max ${className}`}
                    >
                        {Array.from({ length: copiesToRender }).map((_, i) => (
                            <div
                                ref={i === 0 ? contentRef : undefined}
                                key={i}
                                className="flex w-max items-center"
                                style={{
                                    gap: "var(--marquee-spacing)",
                                    paddingLeft: "var(--marquee-spacing)",
                                }}
                            >
                                {children}
                            </div>
                        ))}
                    </div>
                </div>
            );
        },
    ),
);

Marquee.displayName = "Marquee";
