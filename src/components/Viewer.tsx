"use client";

import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence } from "motion/react";
import * as motion from "motion/react-client";

import {
    SlideBackgroundComposer,
    SlideComposer,
} from "@/components/SlideComposer";
import { ContentResizer } from "@/components/ContentResizer";
import { useSocketStore } from "@/stores/socket.store";
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty";
import { HugeiconsIcon } from "@hugeicons/react";
import { ModernTvIssueIcon } from "@hugeicons-pro/core-stroke-rounded";
import { BrandIcon } from "@/components/Brand";
import { Spinner } from "@/components/ui/spinner";

function BlackScreen() {
    return <div className="h-[1080px] w-[1920px] bg-black" />;
}

function ClearScreen() {
    return <></>;
}

interface ViewerProps {
    currentProjection: number;
    currentIndex: number;
}
export const Viewer = memo(function Viewer({
    currentProjection = 0,
    currentIndex = 0,
}: ViewerProps) {
    const SlideCompose = useCallback(() => {
        return (
            <SlideComposer
                currentProjection={currentProjection}
                currentIndex={currentIndex}
            />
        );
    }, [currentIndex, currentProjection]);

    const CurrentComponent = useMemo(
        () =>
            currentIndex === -1
                ? BlackScreen
                : currentIndex === -2
                  ? ClearScreen
                  : SlideCompose,
        [SlideCompose, currentIndex],
    );

    return (
        <>
            <SlideBackgroundComposer
                currentProjection={currentProjection}
                currentIndex={currentIndex}
            />

            <AnimatePresence>
                <motion.div
                    key={currentIndex}
                    className="absolute h-full w-full"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1 }}
                    data-slot="foreground"
                >
                    <ContentResizer className="h-full w-full">
                        <CurrentComponent />
                    </ContentResizer>
                </motion.div>
            </AnimatePresence>
        </>
    );
});

export function OnScreenViewer() {
    const socket = useSocketStore((s) => s.socket);
    const [currentProjection, setCurrentProjection] = useState(0);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (!socket) return;

        const updateIndex = (
            currentProjection: number,
            _: number,
            viewIndex: number,
        ) => {
            setCurrentProjection(currentProjection);
            setCurrentIndex(viewIndex);
        };
        const viewerManipulated = (index: number) => setCurrentIndex(index);

        socket.emit("client:screen:index:init", updateIndex);
        socket.on("server:screen:index:update", updateIndex);
        socket.on("server:screen:specialScreen:set", viewerManipulated);

        return () => {
            socket.off("server:screen:index:update", updateIndex);
            socket.off("server:screen:specialScreen:set", viewerManipulated);
        };
    }, [socket]);

    return (
        <Viewer
            currentProjection={currentProjection}
            currentIndex={currentIndex}
        />
    );
}

function EmptySignal() {
    return (
        <div className="dark text-foreground flex h-dvh w-dvw bg-black">
            <Empty className="gap-12">
                <div className="flex w-full flex-1" />

                <EmptyHeader className="max-w-3xl gap-4">
                    <EmptyMedia
                        variant={"icon"}
                        className="mb-4 size-20 rounded-xl [&_svg:not([class*='size-'])]:size-12"
                    >
                        <HugeiconsIcon icon={ModernTvIssueIcon} />
                    </EmptyMedia>
                    <EmptyTitle className="text-4xl font-bold">
                        No Source Detected
                    </EmptyTitle>
                    <EmptyDescription className="text-xl/relaxed">
                        Please start a controller stream to use this feature.
                    </EmptyDescription>
                </EmptyHeader>
                <EmptyContent className="max-w-3xl gap-8 text-xl">
                    <div className="flex w-full items-center justify-center gap-4">
                        <Spinner className="size-5" /> Searching...
                    </div>
                </EmptyContent>

                <div className="flex w-full flex-1 flex-col items-center justify-center">
                    <div className="h-12 w-full max-w-32">
                        <ContentResizer className="h-full w-full">
                            <BrandIcon />
                        </ContentResizer>
                    </div>
                </div>
            </Empty>
        </div>
    );
}

export function SignalCatcher({ children }: { children: React.ReactNode }) {
    const socket = useSocketStore((s) => s.socket);
    const [hasController, setHasController] = useState(false);

    useEffect(() => {
        if (!socket) return;

        socket.emit("client:socket:hasAny");
        socket.on("server:socket:hasAny", setHasController);

        return () => {
            socket.off("server:socket:hasAny", setHasController);
        };
    }, [socket]);

    return hasController ? children : <EmptySignal />;
}
