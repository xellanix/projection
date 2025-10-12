"use client";

import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence } from "motion/react";
import * as motion from "motion/react-client";

import {
    SlideBackgroundComposer,
    SlideComposer,
} from "@/components/SlideComposer";
import { ContentResizer } from "@/components/ContentResizer";
import { useSocket } from "@/context/SocketContext";

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
    const socket = useSocket();
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
