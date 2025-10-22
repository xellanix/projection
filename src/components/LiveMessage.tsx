import { ContentResizer } from "@/components/ContentResizer";
import { Marquee, type MarqueeHandle } from "@/components/Marquee";
import { AnimatePresence } from "motion/react";
import * as motion from "motion/react-client";
import { memo, useRef } from "react";

interface LiveMessageProps {
    message: string;
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

export const LiveMessage = memo(function LiveMessage({
    message,
    isOpen,
    setIsOpen,
}: LiveMessageProps) {
    const marqueeRef = useRef<MarqueeHandle>(null);

    const finish = () => setTimeout(() => setIsOpen(false), 1000);

    return (
        <div className="absolute h-full w-full">
            <ContentResizer className="h-full w-full">
                <div className="relative flex h-[1080px] w-[1920px] flex-col items-center justify-center">
                    <AnimatePresence>
                        {isOpen && (
                            <motion.div
                                className="absolute h-full w-full *:absolute *:bottom-0"
                                initial={{ x: 1920, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: -1920, opacity: 0 }}
                                transition={{ duration: 0.5, ease: "easeOut" }}
                            >
                                <Marquee
                                    ref={marqueeRef}
                                    className="bg-background text-brand py-6 text-[5.25rem] leading-none font-black uppercase"
                                    spacingFactor={1}
                                    delay={1000}
                                    speed={200}
                                    loop={1}
                                    onFinish={finish}
                                >
                                    {message}
                                </Marquee>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </ContentResizer>
        </div>
    );
});
