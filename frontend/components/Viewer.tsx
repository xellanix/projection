import { memo, useEffect, useMemo, useState } from "react";
import { AnimatePresence } from "motion/react";
import * as motion from "motion/react-client";

import {
    SlideBackgroundComposer,
    SlideComposer,
} from "@/components/SlideComposer";
import { ContentResizer } from "@/components/core/ContentResizer";
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
import { BrandHorizontal } from "@/components/core/Brand";
import { Spinner } from "@/components/ui/spinner";
import {
    transitionVariants,
    useTransitionStore,
} from "@/stores/transition.store";
import { useShallow } from "zustand/react/shallow";
import { LiveMessage } from "@/components/live-message/LiveMessage";
import { useSettingsStore } from "@/stores/settings.store";
import { SPECIAL_INDEX } from "@/data/special-index";
import { VideoPlayer } from "@/components/core/VideoPlayer";

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

export function Backcover() {
    const [contentResolution, color] = useSettingsStore(
        useShallow((s) => [
            s.global.remap.contentResolution,
            s.global.backdrop.color,
        ]),
    );

    return (
        <div
            style={{
                width: `${contentResolution.width}px`,
                height: `${contentResolution.height}px`,
                backgroundColor: color,
            }}
        />
    );
}

function ClearScreen() {
    return <></>;
}

function CoverScreen() {
    const [type, content, scaleStrategy] = useSettingsStore(
        useShallow((s) => [
            s.global.cover.type,
            s.global.cover.content,
            s.global.cover.scaleStrategy === "fit"
                ? "object-contain"
                : "object-cover",
        ]),
    );

    if (type === "image") {
        return (
            <img
                src={content}
                alt="Cover Screen"
                className={"size-full " + scaleStrategy}
            />
        );
    } else if (type === "video") {
        return (
            <VideoPlayer
                src={content}
                muted
                loop
                autoPlay
                preload="auto"
                className={scaleStrategy}
            />
        );
    }

    return null;
}

const ScreenContent = memo(
    function ScreenContent({
        currentProjection,
        currentIndex,
    }: {
        currentProjection: number;
        currentIndex: number;
    }) {
        switch (currentIndex) {
            case SPECIAL_INDEX.TRANSPARENT:
            case SPECIAL_INDEX.CLEAR:
                return <ClearScreen />;
            case SPECIAL_INDEX.COVER:
                return <CoverScreen />;
            case SPECIAL_INDEX.BLACK:
                return <BlackScreen />;
            default:
                return (
                    <SlideComposer
                        currentProjection={currentProjection}
                        currentIndex={currentIndex}
                    />
                );
        }
    },
    (prev, next) => {
        // If the previous or next index is transparent or clear, skip re-render.
        if (
            (prev.currentIndex === SPECIAL_INDEX.CLEAR &&
                next.currentIndex === SPECIAL_INDEX.TRANSPARENT) ||
            (prev.currentIndex === SPECIAL_INDEX.TRANSPARENT &&
                next.currentIndex === SPECIAL_INDEX.CLEAR)
        )
            return true;

        // If the index changes, the structural output changes, so we must re-render.
        if (prev.currentIndex !== next.currentIndex) return false;

        // If the index is special, but not stopped, the component ignores prop projection.
        // We return 'true' (props are equal) to skip re-render even if projection changed.
        if (
            next.currentIndex !== SPECIAL_INDEX.STOPPED &&
            next.currentIndex < 0
        )
            return true;

        // Default case: The output depends on projection, so we check if it changed.
        return prev.currentProjection === next.currentProjection;
    },
);

const ForegroundAnimator = memo(
    function ForegroundAnimator({
        motionKey,
        transition,
        children,
    }: {
        motionKey: string | number;
        transition: string;
        children: React.ReactNode;
    }) {
        return (
            <AnimatePresence custom={transition}>
                <motion.div
                    key={motionKey}
                    className="absolute h-full w-full"
                    initial="enter"
                    animate="center"
                    exit="exit"
                    custom={transition}
                    variants={transitionVariants}
                    data-slot="foreground"
                >
                    <ContentResizer className="h-full w-full">
                        {children}
                    </ContentResizer>
                </motion.div>
            </AnimatePresence>
        );
    },
    (prev, next) => prev.motionKey === next.motionKey,
);

const bgIndex = (index: number, raw?: number) => {
    if (raw === undefined) return index;

    switch (index) {
        case SPECIAL_INDEX.BLACK:
        case SPECIAL_INDEX.COVER:
            return raw;
        default:
            return index;
    }
};
const buildFKey = (projection: number, index: number) => {
    return index < 0 ? index : `${projection}-${index}`;
};
interface ViewerProps {
    currentProjection: number;
    currentIndex: number;
    rawIndex?: number;
}
export const Viewer = memo(function Viewer({
    currentProjection = 0,
    currentIndex = 0,
    rawIndex,
}: ViewerProps) {
    const motionKey = buildFKey(currentProjection, currentIndex);
    const transition = useMemo(() => {
        return useTransitionStore
            .getState()
            .getTransition(currentProjection, currentIndex);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [motionKey]);

    return (
        <>
            <SlideBackgroundComposer
                currentProjection={currentProjection}
                currentIndex={bgIndex(currentIndex, rawIndex)}
            />

            <ForegroundAnimator motionKey={motionKey} transition={transition}>
                <ScreenContent
                    currentProjection={currentProjection}
                    currentIndex={currentIndex}
                />
            </ForegroundAnimator>
        </>
    );
});

export const OnScreenViewer = memo(function OnScreenViewer() {
    const socket = useSocketStore((s) => s.socket);
    const [currentProjection, setCurrentProjection] = useState(0);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [rawIndex, setRawIndex] = useState(0);
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
            if (viewIndex === _) return;
            setRawIndex(_);
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

    if (currentIndex === SPECIAL_INDEX.STOPPED) {
        return <EmptySignal variant="source-stopped" />;
    }

    return (
        <>
            <Viewer
                currentProjection={currentProjection}
                currentIndex={currentIndex}
                rawIndex={rawIndex}
            />
            <LiveMessage remaining={remaining} progress={progress} />
        </>
    );
});

export const ViewerContainer = memo(function ViewerContainer({
    children,
}: {
    children: React.ReactNode;
}) {
    const contentResolution = useSettingsStore(
        (s) => s.global.remap.contentResolution,
    );

    return (
        <div
            className="relative w-full"
            style={{
                aspectRatio: `${contentResolution.width}/${contentResolution.height}`,
            }}
            data-slot="viewer"
        >
            {children}
        </div>
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
                            <BrandHorizontal className="aspect-[131/28] h-auto w-full max-w-32" />
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
