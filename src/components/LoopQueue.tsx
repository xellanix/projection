"use client";

import { IconButton } from "@/components/core/Buttons";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useControl, useControlApi } from "@/context/ControlContext";
import { compareArrays } from "@/lib/utils";
import { useGroupStore } from "@/stores/group.store";
import { useLoopStore } from "@/stores/loop.store";
import { useProjectionStore } from "@/stores/projection.store";
import { useSocketStore } from "@/stores/socket.store";
import type { ProjectionLoopQueue } from "@/types";
import {
    ArrowLeft01Icon,
    ArrowRight01Icon,
} from "@hugeicons-pro/core-stroke-rounded";
import { memo, useCallback, useEffect, useRef, useState } from "react";

function NavButtonR({ type }: { type: "next" | "prev" }) {
    const setCurrentIndex = useControl((s) => s.setCurrentIndex);
    const move = useCallback(() => {
        useLoopStore.getState().moveIndex(type === "prev" ? -1 : 1);

        const { group, item } = useLoopStore.getState().getCurrentQueue();
        const normalize = useGroupStore.getState().getIndex(group, item);
        if (normalize === -1) return;

        setCurrentIndex(normalize, "loop-queue");
    }, [type, setCurrentIndex]);

    return (
        <ButtonGroup>
            <IconButton
                label={type === "prev" ? "Previous Loop" : "Next Loop"}
                icon={type === "prev" ? ArrowLeft01Icon : ArrowRight01Icon}
                iconStrokeWidth={2.5}
                onClick={move}
                accelerator={{
                    key: type === "prev" ? "A" : "D",
                }}
            />
        </ButtonGroup>
    );
}
const NavButton = memo(NavButtonR);
NavButton.displayName = "NavButton";

interface LoopQueueItemProps extends ProjectionLoopQueue {
    queueIndex: number;
}
function LoopQueueItemR({ queueIndex, group, item }: LoopQueueItemProps) {
    const setCurrentIndex = useControl((s) => s.setCurrentIndex);
    const isActive = useLoopStore((s) => queueIndex <= s.queueIndex);

    const goTo = useCallback(() => {
        useLoopStore.getState().setQueueIndex(queueIndex);
        const normalize = useGroupStore.getState().getIndex(group, item);
        if (normalize === -1) return;

        setCurrentIndex(normalize, "loop-queue");
    }, [queueIndex, group, item, setCurrentIndex]);

    return (
        <Button
            variant={"outline"}
            size={"default"}
            className="data-[state=on]:bg-brand data-[state=on]:text-brand-foreground data-[state=on]:hover:bg-brand-hover data-[state=on]:hover:text-brand-foreground min-w-9 px-2"
            onClick={goTo}
            data-state={isActive ? "on" : "off"}
        >
            <span className="in-data-[state=on]:[&>span:first-child]:text-brand-foreground/80">
                {item !== undefined && (
                    <span className="text-muted-foreground">#</span>
                )}
                {item ?? group}
            </span>
        </Button>
    );
}
const LoopQueueItem = memo(LoopQueueItemR);
LoopQueueItem.displayName = "LoopQueueItem";

function LoopQueueR() {
    const queue = useLoopStore((s) => s.queue);
    const parentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const unsubscribe = useLoopStore.subscribe((s, prev) => {
            if (s.queueIndex === prev.queueIndex) return;

            const element = parentRef?.current?.children[s.queueIndex];
            element?.scrollIntoView({
                block: "nearest",
                inline: "center",
                behavior: "smooth",
            });
        });

        return unsubscribe;
    }, []);

    if (queue.length <= 0) return null;

    return (
        <ButtonGroup aria-label="Slide Loop" className="w-full shrink-0">
            <NavButton type="prev" />
            <ScrollArea className="flex-1 flex-row">
                <ButtonGroup
                    ref={parentRef}
                    aria-label="Slide Loop Queue"
                    className="@container/slide-loop flex w-full flex-row !rounded-md"
                >
                    {queue.map((item, i) => (
                        <LoopQueueItem key={i} queueIndex={i} {...item} />
                    ))}
                </ButtonGroup>
                <ScrollBar orientation="horizontal" />
            </ScrollArea>
            <NavButton type="next" />
        </ButtonGroup>
    );
}
const LoopQueue = memo(LoopQueueR);
LoopQueue.displayName = "LoopQueue";

function LoopQueueSyncR() {
    const socket = useSocketStore((s) => s.socket);
    const [isLoaded, setIsLoaded] = useState(false);
    const control = useControlApi();

    useEffect(() => {
        const unsubscribe = control.subscribe((s, prev) => {
            if (s.activator === "loop-queue") return;

            const notReset = s.currentProjection === prev.currentProjection;
            if (
                notReset &&
                (s.currentIndex === prev.currentIndex ||
                    s.activator === "server")
            )
                return;

            if (!notReset) {
                useLoopStore
                    .getState()
                    .syncWithProjection(
                        useProjectionStore.getState().projections[
                            s.currentProjection
                        ],
                    );
                useLoopStore.getState().resetQueueIndex(s.activator);
                return;
            }

            const index = useLoopStore.getState().syncNextQueueContent();
            if (index === -1 || index !== s.currentIndex) return;

            useLoopStore.getState().moveNext();
        });

        return unsubscribe;
    }, [control]);

    useEffect(() => {
        const unsubscribe = useGroupStore.subscribe((s, prev) => {
            if (compareArrays(s.groupIndices, prev.groupIndices)) return;
            useLoopStore.getState().syncNextQueueContent();
        });

        return unsubscribe;
    }, []);

    useEffect(() => {
        if (!socket || !isLoaded) return;

        const unsubscribe = useLoopStore.subscribe((s, prev) => {
            if (s.queueIndex === prev.queueIndex || s.activator === "server")
                return;
            socket.emit("client:loop:update", s.queueIndex);
        });

        const update = (queueIndex: number) => {
            useLoopStore.getState().setQueueIndex(queueIndex, "server");
        };
        socket.on("server:loop:update", update);

        return () => {
            unsubscribe();
            socket.off("server:loop:update", update);
        };
    }, [socket, isLoaded]);

    useEffect(() => {
        if (!socket) return;

        const init = (queueIndex: number) => {
            useLoopStore.getState().setQueueIndex(queueIndex, "server");
            setIsLoaded(true);
        };
        socket.on("server:loop:init", init);

        return () => {
            socket.off("server:loop:init", init);
        };
    }, [socket]);

    return null;
}
const LoopQueueSync = memo(LoopQueueSyncR);
LoopQueueSync.displayName = "LoopQueueSync";

export { LoopQueue, LoopQueueSync };
