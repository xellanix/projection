"use client";

import { ContentResizer } from "@/components/ContentResizer";
import { VideoPlayer } from "@/components/VideoPlayer";
import { cn } from "@/lib/utils";
import { useProjectionStore } from "@/stores/projection.store";
import { useSettingsStore } from "@/stores/settings.store";
import {
    transitionVariants,
    useTransitionStore,
} from "@/stores/transition.store";
import type { ProjectionItem } from "@/types";
import { AnimatePresence } from "motion/react";
import * as motion from "motion/react-client";
import { memo, useEffect, useMemo } from "react";

interface SlideComposerProps {
    currentProjection: number;
    currentIndex: number;
}
export const SlideBackgroundComposer = memo(function SlideBackgroundComposer({
    currentProjection,
    currentIndex,
}: SlideComposerProps) {
    const contentResolution = useSettingsStore(
        (s) => s.global.remap.contentResolution,
    );

    const setBg = useProjectionStore((s) => s.setCurrentBackground);
    const [background, index] = useProjectionStore((s) => s.currentBackground);
    
    useEffect(() => {
        setBg(currentProjection, currentIndex);
    }, [currentIndex, currentProjection, setBg]);

    const getTransition = useTransitionStore((s) => s.getTransition);
    const transition = useMemo(
        () => getTransition(currentProjection, currentIndex),
        [currentProjection, currentIndex, getTransition],
    );

    return (
        <AnimatePresence custom={transition}>
            <motion.div
                key={index}
                className="absolute h-full w-full"
                initial="enter"
                animate="center"
                exit="exit"
                custom={transition}
                variants={transitionVariants}
                data-slot="background"
            >
                <ContentResizer className="h-full w-full">
                    <div
                        className="flex flex-col items-center justify-center bg-black"
                        style={{
                            width: `${contentResolution.width}px`,
                            height: `${contentResolution.height}px`,
                        }}
                    >
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
    const contentResolution = useSettingsStore(
        (s) => s.global.remap.contentResolution,
    );

    const getContents = useProjectionStore((s) => s.getContents);
    const content = useMemo(
        () => getContents(currentProjection)[currentIndex] ?? null,
        [currentIndex, getContents, currentProjection],
    );

    return (
        <div
            className="flex flex-col items-center justify-center"
            style={{
                width: `${contentResolution.width}px`,
                height: `${contentResolution.height}px`,
            }}
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
            return (
                <img
                    src={content.content}
                    alt="Content Image"
                    className="size-full object-contain"
                />
            );
        case "Text":
            return (
                <span
                    className={cn(
                        "text-8xl font-bold text-white",
                        content.options?.className,
                    )}
                    style={{ ...content.options?.style }}
                >
                    {content.content}
                </span>
            );
        case "Component":
            return <content.content />;
        default:
            return null;
    }
});
