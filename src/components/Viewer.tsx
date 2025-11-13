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
import {
    ModernTvIssueIcon,
    VideoOffIcon,
} from "@hugeicons-pro/core-stroke-rounded";
import { BrandIcon } from "@/components/Brand";
import { Spinner } from "@/components/ui/spinner";
import {
    transitionVariants,
    useTransitionStore,
} from "@/stores/transition.store";
import { useShallow } from "zustand/react/shallow";
import { LiveMessage } from "@/components/LiveMessage";
import { useSettingsStore } from "@/stores/settings.store";

function BlackScreen() {
    const contentResolution = useSettingsStore(
        (s) => s.global.remap.contentResolution,
    );

    return (
        <div
            className="bg-black"
            style={{
                width: `${contentResolution.width}px`,
                height: `${contentResolution.height}px`,
            }}
        />
    );
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
    const transition = useTransitionStore(
        useShallow((s) => s.getTransition(currentProjection, currentIndex)),
    );

    const SlideCompose = useCallback(() => {
        return (
            <SlideComposer
                currentProjection={currentProjection}
                currentIndex={currentIndex}
            />
        );
    }, [currentIndex, currentProjection]);

    const CurrentComponent = useMemo(() => {
        switch (currentIndex) {
            case -1:
                return BlackScreen;
            case -2:
                return ClearScreen;
            default:
                return SlideCompose;
        }
    }, [SlideCompose, currentIndex]);

    return (
        <>
            <div className="absolute size-full">
                <ContentResizer className="size-full">
                    <BlackScreen />
                </ContentResizer>
            </div>

            <SlideBackgroundComposer
                currentProjection={currentProjection}
                currentIndex={currentIndex}
            />

            <AnimatePresence custom={transition}>
                <motion.div
                    key={`${currentProjection}-${currentIndex}`}
                    className="absolute h-full w-full"
                    initial="enter"
                    animate="center"
                    exit="exit"
                    custom={transition}
                    variants={transitionVariants}
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

export const OnScreenViewer = memo(function OnScreenViewer() {
    const socket = useSocketStore((s) => s.socket);
    const [currentProjection, setCurrentProjection] = useState(0);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [remaining, setRemaining] = useState(3);
    const [progress, setProgress] = useState(0);
    const setMessage = useSettingsStore((s) => s.setMessage);

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
        const initMessage = (
            message: string,
            isOpen: boolean,
            remaining?: number,
            progress?: number,
        ) => {
            setMessage(message, isOpen);
            setRemaining(remaining ?? 3);
            setProgress(progress ?? 0);
        };

        socket.emit("client:screen:index:init", updateIndex);
        socket.emit("client:screen:message:init:request");
        socket.on("server:screen:index:update", updateIndex);
        socket.on("server:screen:specialScreen:set", viewerManipulated);
        socket.on("server:screen:message:toggle", initMessage);
        socket.on("server:screen:message:init", initMessage);

        return () => {
            socket.off("server:screen:index:update", updateIndex);
            socket.off("server:screen:specialScreen:set", viewerManipulated);
            socket.off("server:screen:message:toggle", initMessage);
            socket.off("server:screen:message:init", initMessage);
        };
    }, [setMessage, socket]);

    if (currentIndex === -3) {
        return <EmptySignal variant="source-stopped" />;
    }

    return (
        <>
            <Viewer
                currentProjection={currentProjection}
                currentIndex={currentIndex}
            />
            <LiveMessage remaining={remaining} progress={progress} />
        </>
    );
});

interface EmptySignalProps {
    variant?: "no-source" | "source-stopped";
}
const EmptySignal = memo(function EmptySignal({
    variant = "no-source",
}: EmptySignalProps) {
    const contentResolution = useSettingsStore(
        (s) => s.global.remap.contentResolution,
    );

    return (
        <div className="dark text-foreground absolute h-full w-full bg-black">
            <ContentResizer className="h-full w-full">
                <div
                    className="flex"
                    style={{
                        width: `${contentResolution.width}px`,
                        height: `${contentResolution.height}px`,
                    }}
                >
                    <Empty className="gap-12">
                        <div className="flex w-full flex-1" />
                        <EmptyHeader className="max-w-3xl gap-4">
                            <EmptyMedia
                                variant={"icon"}
                                className="mb-4 size-20 rounded-xl [&_svg:not([class*='size-'])]:size-12"
                            >
                                <HugeiconsIcon
                                    icon={
                                        variant === "no-source"
                                            ? ModernTvIssueIcon
                                            : VideoOffIcon
                                    }
                                />
                            </EmptyMedia>
                            <EmptyTitle className="text-4xl font-bold">
                                {variant === "no-source"
                                    ? "No Source Has Been Detected"
                                    : "The Projection Has Been Stopped"}
                            </EmptyTitle>
                            <EmptyDescription className="text-xl/relaxed">
                                {variant === "no-source" ? (
                                    "Please start a controller stream to use this feature."
                                ) : (
                                    <>
                                        To start the projection, click the{" "}
                                        <b>
                                            <u>Project</u>
                                        </b>{" "}
                                        button in the controller.
                                    </>
                                )}
                            </EmptyDescription>
                        </EmptyHeader>
                        {variant === "no-source" && (
                            <EmptyContent className="max-w-3xl gap-8 text-xl">
                                <div className="flex w-full items-center justify-center gap-4">
                                    <Spinner className="size-5" /> Searching...
                                </div>
                            </EmptyContent>
                        )}
                        <div className="flex w-full flex-1 flex-col items-center justify-center">
                            <div className="h-12 w-full max-w-32">
                                <ContentResizer className="h-full w-full">
                                    <BrandIcon />
                                </ContentResizer>
                            </div>
                        </div>
                    </Empty>
                </div>
            </ContentResizer>
        </div>
    );
});

export function SignalCatcher({ children }: { children: React.ReactNode }) {
    const socket = useSocketStore((s) => s.socket);
    const [hasController, setHasController] = useState(false);
    const setMessage = useSettingsStore((s) => s.setMessage);

    useEffect(() => {
        if (!socket) return;

        const hasAnyCallback = (hasAny: boolean) => {
            setHasController(hasAny);
            if (!hasAny) setMessage("", false);
        };

        socket.emit("client:socket:hasAny");
        socket.on("server:socket:hasAny", hasAnyCallback);

        return () => {
            socket.off("server:socket:hasAny", hasAnyCallback);
        };
    }, [setMessage, socket]);

    return hasController ? children : <EmptySignal />;
}
