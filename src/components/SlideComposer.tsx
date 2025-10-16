"use client";

import { ContentResizer } from "@/components/ContentResizer";
import { VideoPlayer } from "@/components/VideoPlayer";
import { useBackgrounds, useProjection } from "@/context/ProjectionContext";
import {
    transitionVariants,
    useTransitionStore,
} from "@/stores/transition.store";
import type { ProjectionItem } from "@/types";
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

    const getTransition = useTransitionStore((s) => s.getTransition);
    const transition = useMemo(
        () => getTransition(currentProjection, currentIndex),
        [currentProjection, currentIndex, getTransition],
    );

    return (
        <AnimatePresence custom={transition}>
            <motion.div
                key={maps[currentProjection]?.[currentIndex] ?? 0}
                className="absolute h-full w-full"
                initial="enter"
                animate="center"
                exit="exit"
                custom={transition}
                variants={transitionVariants}
                data-slot="background"
            >
                <ContentResizer className="h-full w-full">
                    <div className="flex h-[1080px] w-[1920px] flex-col items-center justify-center bg-black">
                        <VideoPlayer
                            src={background}
                            muted
                            autoPlay
                            loop
                            background
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
        <div
            className="flex h-[1080px] w-[1920px] flex-col items-center justify-center"
            data-slot="composer"
        >
            <div
                className="relative flex size-full flex-col items-center justify-center gap-4"
                data-slot="composer-container"
            >
                {content && <SlideComposerContent content={content} />}
            </div>
        </div>
    );
});

const SlideComposerContent = memo(function SlideComposerContent({
    content,
}: {
    content: ProjectionItem;
}) {
    switch (content.type) {
        case "Video":
            return <VideoPlayer src={content.content} autoPlay loop muted />;
        case "Image":
            return <img src={content.content} alt="Content Image" />;
        case "Text":
            return (
                <span className="text-8xl font-bold text-white">
                    {content.content}
                </span>
            );
        case "Component":
            return <content.content />;
        default:
            return null;
    }
});
