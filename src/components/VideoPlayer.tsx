"use client";

import { usePreview } from "@/context/PreviewContext";
import { memo, type DetailedHTMLProps } from "react";

export const VideoPlayer = memo(function VideoPlayer(
    props: DetailedHTMLProps<
        React.VideoHTMLAttributes<HTMLVideoElement>,
        HTMLVideoElement
    >,
    ref?: React.ForwardedRef<HTMLVideoElement>,
) {
    const preview = usePreview();

    return (
        <video
            {...props}
            ref={ref}
            autoPlay={!preview.isPreview && props.autoPlay}
        />
    );
});
