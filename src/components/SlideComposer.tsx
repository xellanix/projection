"use client";

import { ContentResizer } from "@/components/ContentResizer";
import { VideoPlayer } from "@/components/VideoPlayer";
import { useBackgrounds, useProjection } from "@/context/ProjectionContext";
import { AnimatePresence } from "motion/react";
import * as motion from "motion/react-client";
import { memo, useMemo } from "react";

interface SlideComposerProps {
    currentProjection: number;
    currentIndex: number;
}
export const SlideBackgroundComposer = memo(function SlideBackgroundComposer({
    currentProjection,
    currentIndex,
}: SlideComposerProps) {
    const [backgrounds, maps] = useBackgrounds();

    const background = useMemo(() => {
        const bgIndex = maps[currentProjection]?.[currentIndex] ?? 0;
        return backgrounds[bgIndex] ?? "";
    }, [backgrounds, currentIndex, currentProjection, maps]);

    return (
        <AnimatePresence>
            <motion.div
                key={maps[currentProjection]?.[currentIndex] ?? 0}
                className="absolute h-full w-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1 }}
            >
                <ContentResizer className="h-full w-full">
                    <div className="flex h-[1080px] w-[1920px] flex-col items-center justify-center bg-black">
                        <VideoPlayer
                            src={background}
                            muted
                            autoPlay={true}
                            loop
                        ></VideoPlayer>
                    </div>
                </ContentResizer>
            </motion.div>
        </AnimatePresence>
    );
});

export const SlideComposer = memo(function SlideComposer({
    currentProjection,
    currentIndex,
}: SlideComposerProps) {
    const masters = useProjection();
    const content = useMemo(
        () => masters[currentProjection]?.contents[currentIndex] ?? null,
        [currentIndex, masters, currentProjection],
    );

    return (
        <div className="flex h-[1080px] w-[1920px] flex-col items-center justify-center">
            <div className="relative flex flex-col items-center justify-center gap-4">
                <span className="text-8xl font-bold text-white">
                    {content?.content}
                </span>
            </div>
        </div>
    );
});
