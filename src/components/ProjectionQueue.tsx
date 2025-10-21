"use client";

import { Button } from "@/components/ui/button";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useControl } from "@/context/ControlContext";
import { useGlobalKeyboard } from "@/context/GlobalKeyboardContext";
import { usePreview } from "@/context/PreviewContext";
import { cn, mod } from "@/lib/utils";
import { useProjectionStore } from "@/stores/projection.store";
import type { ProjectionItem } from "@/types";
import { ArrowRight01Icon } from "@hugeicons-pro/core-stroke-rounded";
import { HugeiconsIcon } from "@hugeicons/react";
import { memo, useCallback, useEffect, useMemo } from "react";
import { useShallow } from "zustand/react/shallow";

const createItemName = (c: ProjectionItem) => {
    return c.name || (c.type !== "Component" && c.content) || "Untitled";
};

export const ProjectionQueue = memo(function ProjectionQueue() {
    const [setCurrentProjection, setCurrentIndex] = useControl(
        useShallow((s) => [s.setCurrentProjection, s.setCurrentIndex]),
    );
    const projections = useProjectionStore((s) => s.projections);

    const handleClick = useCallback(
        (projectionIndex: React.SetStateAction<number>, index: number) =>
            () => {
                setCurrentProjection(projectionIndex);
                setCurrentIndex(index);
            },
        [setCurrentProjection, setCurrentIndex],
    );

    const [register, unregister] = useGlobalKeyboard();
    useEffect(() => {
        register(
            "ArrowDown",
            handleClick((p) => Math.min(p + 1, projections.length - 1), 0),
        );
        register(
            "ArrowUp",
            handleClick((p) => Math.max(p - 1, 0), 0),
        );

        return () => {
            unregister("ArrowDown");
            unregister("ArrowUp");
        };
    }, [handleClick, projections.length, register, unregister]);

    return (
        <>
            <span className="px-7 text-lg font-semibold">Queue</span>

            <div className="flex-1 overflow-hidden">
                <ScrollArea className="h-full w-full px-4">
                    {projections.map((p, i) => (
                        <Collapsible
                            key={i}
                            className="group/collapsible flex flex-col"
                        >
                            <QueueItem
                                i={i}
                                title={p.title}
                                handleClick={handleClick}
                            />
                            <CollapsibleContent className="flex flex-col">
                                {p.contents.map((c, j) => (
                                    <Button
                                        key={j}
                                        className="hover:bg-sidebar-accent active:bg-sidebar-accent hover:text-sidebar-accent-foreground active:text-sidebar-accent-foreground before:bg-border relative justify-start overflow-hidden rounded-md pl-9 text-left text-ellipsis before:absolute before:top-0 before:bottom-full before:left-3 before:h-full before:w-0.5"
                                        variant={"ghost"}
                                        size={"sm"}
                                        onClick={handleClick(i, j)}
                                    >
                                        {createItemName(c)}
                                    </Button>
                                ))}
                            </CollapsibleContent>
                        </Collapsible>
                    ))}
                </ScrollArea>
            </div>
        </>
    );
});

const QueueItem = memo(function QueueItem({
    i,
    title,
    handleClick,
}: {
    i: number;
    title: string;
    handleClick: (i: number, j: number) => () => void;
}) {
    const [isActive] = useControl(
        useShallow((s) => [s.currentProjection === i]),
    );

    return (
        <div
            className={cn(
                "relative flex flex-row rounded-md",
                "before:bg-brand before:absolute before:top-full before:bottom-full before:left-0 before:z-[1] before:w-0.75 before:rounded-full before:transition-all before:duration-133 before:ease-out",
                {
                    "bg-sidebar-accent/50 before:top-2.5 before:bottom-2.5":
                        isActive,
                },
            )}
        >
            <Button
                className="hover:bg-sidebar-accent active:bg-sidebar-accent hover:text-sidebar-accent-foreground active:text-sidebar-accent-foreground flex-1 justify-start rounded-md text-left"
                variant={"ghost"}
                size={"sm"}
                onClick={handleClick(i, 0)}
            >
                {title}
            </Button>
            <CollapsibleTrigger asChild>
                <Button
                    variant={"ghost"}
                    size={"icon-sm"}
                    className="hover:bg-sidebar-accent active:bg-sidebar-accent hover:text-sidebar-accent-foreground active:text-sidebar-accent-foreground rounded-md"
                >
                    <HugeiconsIcon
                        icon={ArrowRight01Icon}
                        strokeWidth={2.5}
                        className="transition-transform duration-133 ease-out group-data-[state=open]/collapsible:rotate-90"
                    />
                </Button>
            </CollapsibleTrigger>
        </div>
    );
});

export const ProjectionContentQueue = memo(function ProjectionContentQueue() {
    const [currentProjection, setCurrentIndex] = useControl(
        useShallow((s) => [s.currentProjection, s.setCurrentIndex]),
    );
    const getContents = useProjectionStore((s) => s.getContents);

    const [grouped, groupedKeys] = useMemo(() => {
        let index = 0;
        const keys = new Set<string>();
        return [
            getContents(currentProjection).reduce(
                (acc, { group, ...rest }) => {
                    const key = group ?? "Contents";
                    keys.add(key);
                    acc[key] = [
                        ...(acc[key] ?? []),
                        { ...rest, index: index++ },
                    ];
                    return acc;
                },
                {} as Record<string, (ProjectionItem & { index: number })[]>,
            ),
            Array.from(keys),
        ];
    }, [getContents, currentProjection]);

    const goToGroup = useCallback(
        (index: number) => () => {
            if (!groupedKeys.length) return;
            const group = groupedKeys[mod(index, groupedKeys.length)]!;

            setCurrentIndex(grouped[group]![0]!.index);
        },
        [grouped, groupedKeys, setCurrentIndex],
    );

    const [register, unregister] = useGlobalKeyboard();
    useEffect(() => {
        for (let i = 0; i < 10; i++) {
            register(`Shift+Digit${mod(i + 1, 10)}`, goToGroup(i));
            register(`Shift+Numpad${mod(i + 1, 10)}`, goToGroup(i));
        }

        return () => {
            for (let i = 0; i < 10; i++) {
                unregister(`Shift+Digit${i}`);
                unregister(`Shift+Numpad${i}`);
            }
        };
    }, [goToGroup, register, unregister]);

    return (
        <div className="flex h-full w-full flex-col overflow-hidden">
            <ScrollArea className="h-full w-full">
                <div className="flex h-full flex-col gap-2">
                    {groupedKeys.map((g, i) => (
                        <ContentQueueGroup key={i} g={g} items={grouped[g]!} />
                    ))}
                </div>
            </ScrollArea>
        </div>
    );
});

const ContentQueueGroup = memo(function ContentQueueGroup({
    g,
    items,
}: {
    g: string;
    items: (ProjectionItem & {
        index: number;
    })[];
}) {
    return (
        <div className="flex w-full flex-col gap-2">
            <span className="font-semibold">{g}</span>
            <div className="before:bg-border/50 relative flex flex-col gap-2 before:absolute before:top-2 before:bottom-2 before:left-0 before:-z-10 before:w-0.75 before:rounded-full">
                {items.map((c) => (
                    <ContentQueueItem key={c.index} c={c} />
                ))}
            </div>
        </div>
    );
});

const ContentQueueItem = memo(function ContentQueueItem({
    c,
}: {
    c: ProjectionItem & { index: number };
}) {
    const [isActive, setCurrentIndex] = useControl(
        useShallow((s) => [s.currentIndex === c.index, s.setCurrentIndex]),
    );
    const { isPreview } = usePreview();

    return (
        <Button
            className={cn(
                "relative justify-start overflow-hidden rounded-md text-left text-ellipsis",
                "before:bg-brand before:absolute before:top-full before:bottom-full before:left-0 before:z-[1] before:w-0.75 before:rounded-full before:transition-all before:duration-133 before:ease-out",
                {
                    "bg-accent/50 text-accent-foreground before:top-2.5 before:bottom-2.5":
                        isActive && isPreview,
                },
                {
                    "bg-brand text-brand-foreground hover:bg-brand-hover hover:text-brand-foreground before:top-2.5 before:bottom-2.5":
                        isActive && !isPreview,
                },
            )}
            variant={"ghost"}
            size={"sm"}
            onClick={() => setCurrentIndex(c.index)}
        >
            {createItemName(c)}
        </Button>
    );
});
