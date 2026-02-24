import { memo } from "react";

interface FrameProps {
    children: React.ReactNode;
}

const FrameContainer = memo(function FrameContainer({ children }: FrameProps) {
    return <div className="flex flex-col gap-4 py-4">{children}</div>;
});

const FrameHeader = memo(function FrameHeader({ children }: FrameProps) {
    return <div className="flex flex-col gap-2">{children}</div>;
});

const FrameDescription = memo(function FrameDescription({
    children,
}: FrameProps) {
    return <p className="text-muted-foreground text-sm">{children}</p>;
});

export { FrameContainer, FrameHeader, FrameDescription };
