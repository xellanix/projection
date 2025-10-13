"use client";

import { usePreview } from "@/context/PreviewContext";
import { useSocketStore } from "@/stores/socket.store";
import { memo, useEffect, useRef, type DetailedHTMLProps } from "react";

type VideoPlayerProps = DetailedHTMLProps<
    React.VideoHTMLAttributes<HTMLVideoElement>,
    HTMLVideoElement
>;

export const VideoPlayer = memo(function VideoPlayer(props: VideoPlayerProps) {
    const preview = usePreview();

    if (preview.isPreview) {
        return <video {...props} autoPlay={false} />;
    }

    return <OnScreenVideoPlayer {...props} autoPlay={props.autoPlay} />;
});

const OnScreenVideoPlayer = memo(function OnScreenVideoPlayer({
    ...props
}: VideoPlayerProps) {
    const socket = useSocketStore((s) => s.socket);
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (!socket) return;

        // Consumer requests video state to server (1)
        socket.emit("client:video:bg:init:request");
        // Server asks Producer for video state (2)
        socket.on("server:video:bg:init:request", (requestId: string) => {
            if (!videoRef.current) return;

            // Producer sends video state to server (3)
            socket.emit(
                "client:video:bg:init:response",
                requestId,
                !videoRef.current.paused,
                videoRef.current.currentTime,
            );
        });
        // Server sends video state to Consumer (4)
        socket.on(
            "server:video:bg:init:response",
            (isPlaying: boolean, currentTime: number) => {
                if (!videoRef.current) return;

                videoRef.current.currentTime = currentTime;
                /* if (isPlaying) videoRef.current.play().catch(console.error);
                else videoRef.current.pause(); */
            },
        );

        return () => {
            socket.off("server:video:bg:init:request");
            socket.off("server:video:bg:init:response");
        };
    }, [socket]);

    return <video {...props} ref={videoRef} />;
});
