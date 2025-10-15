"use client";

import { usePreview } from "@/context/PreviewContext";
import { cn } from "@/lib/utils";
import { useSocketStore } from "@/stores/socket.store";
import { memo, useEffect, useRef, type DetailedHTMLProps } from "react";

type VideoPlayerProps = DetailedHTMLProps<
    React.VideoHTMLAttributes<HTMLVideoElement>,
    HTMLVideoElement
> & { background?: boolean };

export const VideoPlayer = memo(function VideoPlayer({
    background,
    autoPlay,
    className,
    ...props
}: VideoPlayerProps) {
    const preview = usePreview();

    if (preview.isPreview) {
        return (
            <video
                {...props}
                className={cn("size-full", className)}
                autoPlay={false}
            />
        );
    }

    return (
        <OnScreenVideoPlayer
            {...props}
            className={cn("size-full", className)}
            background={background}
            autoPlay={autoPlay}
        />
    );
});

const OnScreenVideoPlayer = memo(function OnScreenVideoPlayer({
    background,
    ...props
}: VideoPlayerProps) {
    const socket = useSocketStore((s) => s.socket);
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (!socket) return;

        const layer = background ? "bg" : "fg";

        // Consumer requests video state to server (1)
        socket.emit(`client:video:${layer}:init:request`);
        // Server asks Producer for video state (2)
        const initRequest = (requestId: string) => {
            if (!videoRef.current) return;

            // Producer sends video state to server (3)
            socket.emit(
                `client:video:${layer}:init:response`,
                requestId,
                !videoRef.current.paused,
                videoRef.current.currentTime,
            );
        };
        socket.on(`server:video:${layer}:init:request`, initRequest);
        // Server sends video state to Consumer (4)
        const initResponse = (isPlaying: boolean, currentTime: number) => {
            if (!videoRef.current) return;

            videoRef.current.currentTime = currentTime;
            /* if (isPlaying) videoRef.current.play().catch(console.error);
                else videoRef.current.pause(); */
        };
        socket.on(`server:video:${layer}:init:response`, initResponse);

        return () => {
            socket.off(`server:video:${layer}:init:request`, initRequest);
            socket.off(`server:video:${layer}:init:response`, initResponse);
        };
    }, [background, socket]);

    return <video {...props} ref={videoRef} />;
});
