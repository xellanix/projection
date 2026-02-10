"use client";

import React, { useLayoutEffect, useRef, memo } from "react";

interface ContentResizerProps {
    children: React.ReactNode;
    className?: string;
}

export const ContentResizer = memo(function ContentResizer({
    children,
    className,
}: ContentResizerProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const prevScaleRef = useRef(0);

    useLayoutEffect(() => {
        const container = containerRef.current;
        const content = contentRef.current;
        if (!container || !content) return;

        const setScale = (newScale: number, cw: number, ch: number) => {
            if (!Number.isFinite(newScale)) newScale = 0;

            const prevScale = prevScaleRef.current;
            if (newScale === prevScale) return;

            const contentMaxDim = Math.max(cw, ch);
            const renderedPixelDiff =
                Math.abs(newScale - prevScale) * contentMaxDim;
            if (renderedPixelDiff < 2) {
                return;
            }

            content.style.transform = `scale(${newScale})`;
            prevScaleRef.current = newScale;
        };

        const handleResize = () => {
            const pw = container.offsetWidth;
            const ph = container.offsetHeight;
            const cw = content.offsetWidth;
            const ch = content.offsetHeight;

            // prettier-ignore
            if (
                !cw || !ch || !pw || !ph ||
                !Number.isFinite(cw) || !Number.isFinite(ch) ||
                !Number.isFinite(pw) || !Number.isFinite(ph)
            ) {
                setScale(0, cw, ch);
                return;
            }

            const scaleX = pw / cw;
            const scaleY = ph / ch;
            const newScale = Math.min(scaleX, scaleY);

            setScale(newScale, cw, ch);
        };

        // The ResizeObserver will handle all subsequent resizes.
        const observer = new ResizeObserver(() => {
            requestAnimationFrame(handleResize);
        });
        observer.observe(container);
        observer.observe(content);

        return () => observer.disconnect();
    }, []);

    return (
        <div
            ref={containerRef}
            className={`relative flex items-center justify-center overflow-hidden ${className}`}
            data-slot="content-resizer"
        >
            <div
                ref={contentRef}
                className="origin-center transform-[scale(0)]"
            >
                {children}
            </div>
        </div>
    );
});
