import { ContentResizer } from "@/components/ContentResizer";
import { Marquee, type MarqueeHandle } from "@/components/Marquee";
import { useSettingsStore } from "@/stores/settings.store";
import { useSocketStore } from "@/stores/socket.store";
import { AnimatePresence } from "motion/react";
import * as motion from "motion/react-client";
import { memo, useEffect, useRef } from "react";
import { useShallow } from "zustand/react/shallow";

interface LiveMessageProps {
    remaining: number;
    progress: number;
}

export const LiveMessage = memo(function LiveMessage({
    remaining,
    progress,
}: LiveMessageProps) {
    const [isOpen, contentResolution] = useSettingsStore(
        useShallow((s) => [
            s.local.message.isOpen,
            s.global.remap.contentResolution,
        ]),
    );

    const isAnimatePresent =
        (remaining === 3 && progress === 0) ||
        (remaining === 0 && progress === 100);

    return (
        <div className="absolute h-full w-full">
            <ContentResizer className="h-full w-full">
                <div
                    className="relative flex flex-col items-center justify-center"
                    style={{
                        width: `${contentResolution.width}px`,
                        height: `${contentResolution.height}px`,
                    }}
                >
                    <AnimatePresence>
                        {isOpen && (
                            <motion.div
                                className="absolute h-full w-full *:absolute *:bottom-0"
                                initial={{ x: contentResolution.width, opacity: 0 }}
                                animate={{
                                    x: 0,
                                    opacity: 1,
                                    transition: {
                                        duration: isAnimatePresent ? 0.5 : 0,
                                        ease: "easeOut",
                                    },
                                }}
                                exit={{ x: -contentResolution.width, opacity: 0 }}
                                transition={{ duration: 0.5, ease: "easeOut" }}
                            >
                                <LiveMessageMarquee
                                    remaining={remaining}
                                    progress={progress}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </ContentResizer>
        </div>
    );
});

const LiveMessageMarquee = memo(function LiveMessageMarquee({
    remaining,
    progress,
}: LiveMessageProps) {
    const marqueeRef = useRef<MarqueeHandle>(null);

    const socket = useSocketStore((s) => s.socket);
    const [{ message, isOpen }, setIsOpen] = useSettingsStore(
        useShallow((s) => [s.local.message, s.toggleMessage]),
    );

    useEffect(() => {
        const m = marqueeRef.current;
        if (!socket || !m) return;

        const response = () => {
            socket.emit(
                "client:screen:message:init",
                message,
                isOpen,
                m.getRemainingLoops(),
                m.getProgress(),
            );
        };

        socket.on("server:screen:message:init:request", response);

        return () => {
            socket.off("server:screen:message:init:request", response);
        };
    }, [isOpen, message, socket]);

    const finish = () => setTimeout(() => setIsOpen(false), 1000);

    return (
        <Marquee
            ref={marqueeRef}
            className="bg-background text-brand py-6 text-[5.25rem] leading-none font-black uppercase"
            spacingFactor={1}
            delay={1000}
            speed={200}
            loop={remaining}
            progress={progress}
            onFinish={finish}
        >
            {message}
        </Marquee>
    );
});
