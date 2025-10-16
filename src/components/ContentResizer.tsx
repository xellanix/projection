import React, {
    useState,
    useLayoutEffect,
    useRef,
    useCallback,
    memo,
} from "react";

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
    const [scale, setScale] = useState(0);

    const handleResize = useCallback(() => {
        const container = containerRef.current;
        const content = contentRef.current;

        if (container && content) {
            const containerWidth = container.offsetWidth;
            const containerHeight = container.offsetHeight;
            const contentWidth = content.offsetWidth;
            const contentHeight = content.offsetHeight;

            if (contentWidth === 0 || contentHeight === 0) {
                setScale(0);
                return;
            }

            const scaleX = containerWidth / contentWidth;
            const scaleY = containerHeight / contentHeight;
            const newScale = Math.min(scaleX, scaleY);

            setScale(newScale);
        }
    }, []);

    useLayoutEffect(() => {
        // The ResizeObserver will handle all subsequent resizes.
        const observer = new ResizeObserver(handleResize);
        if (containerRef.current) observer.observe(containerRef.current);
        if (contentRef.current) observer.observe(contentRef.current);

        // Initial calculation
        handleResize();

        return () => {
            observer.disconnect();
        };
    }, [handleResize]);

    return (
        <div
            ref={containerRef}
            className={`relative flex items-center justify-center overflow-hidden ${className}`}
            data-slot="content-resizer"
        >
            <div ref={contentRef} style={{ transform: `scale(${scale})` }}>
                {children}
            </div>
        </div>
    );
});
