"use client";

import { Button } from "@/components/ui/button";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Sortable,
    SortableContent,
    SortableItem,
    SortableItemHandle,
    SortableOverlay,
} from "@/components/ui/sortable";
import { useControl } from "@/context/ControlContext";
import { useGlobalKeyboard } from "@/context/GlobalKeyboardContext";
import { usePreview } from "@/context/PreviewContext";
import { cn, mod } from "@/lib/utils";
import { useSidebarControl } from "@/stores/control.store";
import { generateId, useProjectionStore } from "@/stores/projection.store";
import { useSocketStore } from "@/stores/socket.store";
import type { ProjectionItem, ProjectionMasterWithId } from "@/types";
import type { UniqueIdentifier } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import {
    Add01Icon,
    ArrowRight01Icon,
    DragDropVerticalIcon,
} from "@hugeicons-pro/core-stroke-rounded";
import { HugeiconsIcon } from "@hugeicons/react";
import { memo, useCallback, useEffect, useMemo, useRef } from "react";
import { useShallow } from "zustand/react/shallow";
import { useFilePicker } from "use-file-picker";
import { jsonToProjection } from "@/lib/json-to-projection";
import { useGroupStore } from "@/stores/group.store";

const createItemName = (c: ProjectionItem) => {
    return c.name || (c.type !== "Component" && c.content) || "Untitled";
};

export const PreviewQueueReorder = memo(function PreviewQueueReorder() {
    const setCP = useSidebarControl((s) => s.setCurrentProjection);

    const reorder = useCallback(
        (activeIndex: number, overIndex: number) => {
            setCP((p) => {
                if (p === activeIndex) return overIndex;
                else if (p < activeIndex) {
                    if (overIndex <= p) return p + 1;
                    else return p;
                } else {
                    if (overIndex >= p) return p - 1;
                    else return p;
                }
            });
        },
        [setCP],
    );

    return <QueueReorder reorderFunc={reorder} />;
});

export const QueueReorder = memo(function QueueReorder({
    reorderFunc,
}: {
    reorderFunc?: (from: number, to: number) => void;
}) {
    const setP = useProjectionStore((s) => s.setProjectionsWithIds);
    const socket = useSocketStore((s) => s.socket);

    useEffect(() => {
        if (!socket) return;

        const reorder = (activeIndex: number, overIndex: number) => {
            setP((p) => arrayMove(p, activeIndex, overIndex));
            reorderFunc?.(activeIndex, overIndex);
        };

        socket.on("server:queue:reorder", reorder);

        return () => {
            socket.off("server:queue:reorder", reorder);
        };
    }, [socket, setP, reorderFunc]);

    return null;
});

export const ProjectionMutator = memo(function ProjectionMutator() {
    const socket = useSocketStore((s) => s.socket);

    useEffect(() => {
        if (!socket) return;

        const init = (data: (string | number)[]) => {
            const length = data.length;
            const result = new Array<ProjectionMasterWithId>(length);

            for (let i = 0; i < length; i++) {
                const indice = data[i]!;

                if (typeof indice === "string") {
                    const res = jsonToProjection(indice);
                    if (res === null) continue;
                    result[i] = generateId(res);
                    continue;
                }

                result[i] =
                    useProjectionStore.getInitialState().projections[indice]!;
            }

            useProjectionStore.getState().setProjectionsWithIds(result);
        };

        const add = (data: string) => {
            const res = jsonToProjection(data);
            if (res === null) return;
            useProjectionStore.getState().addProjection(res);
        };

        socket.emit(
            "client:queue:init",
            useProjectionStore.getInitialState().projections.length,
        );
        socket.on("server:queue:init", init);
        socket.on("server:queue:add", add);

        return () => {
            socket.off("server:queue:init", init);
            socket.off("server:queue:add", add);
        };
    }, [socket]);

    return null;
});

const AddButton = memo(function AddButton() {
    const { openFilePicker, filesContent, loading } = useFilePicker({
        accept: ".json",
    });
    const socket = useSocketStore((s) => s.socket);

    const [register, unregister] = useGlobalKeyboard();
    useEffect(() => {
        register("Shift+A", openFilePicker);

        return () => {
            unregister("Shift+A");
        };
    }, [register, unregister, openFilePicker]);

    useEffect(() => {
        if (loading || !socket) return;

        for (const file of filesContent) {
            const res = jsonToProjection(file.content);
            if (res === null) continue;
            useProjectionStore.getState().addProjection(res);
            socket.emit("client:queue:add", file.content);
        }
    }, [loading, socket]);

    return (
        <Button
            variant={"ghost"}
            size={"icon-sm"}
            className="hover:bg-sidebar-accent active:bg-sidebar-accent hover:text-sidebar-accent-foreground active:text-sidebar-accent-foreground rounded-md"
            onClick={openFilePicker}
            disabled={loading}
        >
            <HugeiconsIcon
                icon={Add01Icon}
                strokeWidth={2.5}
                className="transition-transform duration-133 ease-out group-data-[state=open]/collapsible:rotate-90"
            />
        </Button>
    );
});

export const ProjectionQueue = memo(function ProjectionQueue() {
    const [setCurrentProjection, setCurrentIndex] = useSidebarControl(
        useShallow((s) => [s.setCurrentProjection, s.setCurrentIndex]),
    );
    const [projections, setProjectionsWithIds] = useProjectionStore(
        useShallow((s) => [s.projections, s.setProjectionsWithIds]),
    );
    const socket = useSocketStore((s) => s.socket);

    const handleClick = useCallback(
        (projectionIndex: React.SetStateAction<number>, index: number) =>
            () => {
                setCurrentProjection(projectionIndex);
                setCurrentIndex(index);
            },
        [setCurrentProjection, setCurrentIndex],
    );

    const onMoved = useCallback(
        (ev: { activeIndex: number; overIndex: number }) => {
            setProjectionsWithIds((p) =>
                arrayMove(p, ev.activeIndex, ev.overIndex),
            );
            socket?.emit("client:queue:reorder", ev.activeIndex, ev.overIndex);

            const updateServer = (p: number) => {
                socket?.emit("client:caster:index:project", p, 0, false);
                return p;
            };

            setCurrentProjection((p) => {
                if (p === ev.activeIndex) return updateServer(ev.overIndex);
                else if (p < ev.activeIndex) {
                    if (ev.overIndex <= p) return updateServer(p + 1);
                    else return p;
                } else {
                    if (ev.overIndex >= p) return updateServer(p - 1);
                    else return p;
                }
            });
        },
        [setCurrentProjection, setProjectionsWithIds, socket],
    );

    const overlay = useCallback(
        (activeItem: { value: UniqueIdentifier }) => {
            const pIndex = projections.findIndex(
                (p) => p.id === activeItem.value,
            );

            if (pIndex === -1) return null;

            return (
                <QueueItem
                    p={projections[pIndex]!}
                    i={pIndex}
                    handleClick={() => () => {
                        /**/
                    }}
                />
            );
        },
        [projections],
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
            <div className="flex flex-row items-center justify-between gap-2 px-4 max-lg:pr-2">
                <span className="text-lg font-semibold">Queue</span>
                <AddButton />
            </div>

            <div className="flex-1 overflow-hidden">
                <Sortable
                    value={projections}
                    onMove={onMoved}
                    getItemValue={(i) => i.id}
                >
                    <ScrollArea className="h-full w-full px-2 lg:px-4 [&>div>div]:!flex [&>div>div]:!flex-col">
                        <SortableContent>
                            {projections.map((p, i) => (
                                <QueueItem
                                    key={p.id}
                                    p={p}
                                    i={i}
                                    handleClick={handleClick}
                                />
                            ))}
                        </SortableContent>
                    </ScrollArea>
                    <SortableOverlay>{overlay}</SortableOverlay>
                </Sortable>
            </div>
        </>
    );
});

const QueueItem = memo(function QueueItem({
    p,
    i,
    handleClick,
}: {
    p: ProjectionMasterWithId;
    i: number;
    handleClick: (i: number, j: number) => () => void;
}) {
    return (
        <SortableItem value={p.id} asChild>
            <Collapsible className="group/collapsible flex flex-col">
                <QueueCollapsibleItem
                    i={i}
                    title={p.title}
                    handleClick={handleClick}
                />
                <CollapsibleContent className="flex flex-col">
                    {p.contents.map((c, j) => (
                        <Button
                            key={j}
                            className="hover:bg-sidebar-accent active:bg-sidebar-accent hover:text-sidebar-accent-foreground active:text-sidebar-accent-foreground before:bg-border relative block justify-start truncate rounded-md pl-11 text-left before:absolute before:top-0 before:bottom-full before:left-3 before:h-full before:w-0.5"
                            variant={"ghost"}
                            size={"sm"}
                            onClick={handleClick(i, j)}
                        >
                            {createItemName(c)}
                        </Button>
                    ))}
                </CollapsibleContent>
            </Collapsible>
        </SortableItem>
    );
});

const QueueCollapsibleItem = memo(function QueueCollapsibleItem({
    i,
    title,
    handleClick,
}: {
    i: number;
    title: string;
    handleClick: (i: number, j: number) => () => void;
}) {
    const [isActive] = useSidebarControl(
        useShallow((s) => [s.currentProjection === i]),
    );

    return (
        <div
            className={cn(
                "relative flex flex-row rounded-md transition-all duration-133 ease-out",
                {
                    "active-projection bg-brand text-brand-foreground":
                        isActive,
                },
            )}
        >
            <SortableItemHandle asChild>
                <Button
                    variant={"ghost"}
                    size={"icon-sm"}
                    tabIndex={-1}
                    className="hover:text-foreground in-[.active-projection]:hover:text-brand-foreground active:text-foreground in-[.active-projection]:active:text-brand-foreground rounded-md hover:bg-transparent active:bg-transparent"
                >
                    <HugeiconsIcon
                        icon={DragDropVerticalIcon}
                        strokeWidth={4}
                        size={"1rem"}
                    />
                </Button>
            </SortableItemHandle>

            <Button
                className="hover:bg-sidebar-accent in-[.active-projection]:hover:bg-brand-hover active:bg-sidebar-accent in-[.active-projection]:active:bg-brand-hover hover:text-sidebar-accent-foreground in-[.active-projection]:hover:text-brand-foreground active:text-sidebar-accent-foreground in-[.active-projection]:active:text-brand-foreground block flex-1 justify-start truncate rounded-md text-left"
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
                    className="hover:bg-sidebar-accent in-[.active-projection]:hover:bg-brand-hover active:bg-sidebar-accent in-[.active-projection]:active:bg-brand-hover hover:text-sidebar-accent-foreground in-[.active-projection]:hover:text-brand-foreground active:text-sidebar-accent-foreground in-[.active-projection]:active:text-brand-foreground rounded-md"
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
    const { isPreview } = usePreview();

    const [grouped, groupedKeys] = useMemo(() => {
        const contents = getContents(currentProjection);

        type GroupItem = ProjectionItem & { index: number };
        const groups: Record<string, GroupItem[]> = {};
        const keys: string[] = [];

        let globalIndex = 0;

        const globalIndices: number[] = [];
        for (const item of contents) {
            const { group, ...rest } = item;
            const key = group ?? "Contents";

            if (!groups[key]) {
                groups[key] = [];
                keys.push(key);
                !isPreview && globalIndices.push(globalIndex);
            }

            groups[key].push({
                ...rest,
                index: globalIndex++,
            });
        }
        !isPreview && useGroupStore.getState().init(globalIndices);

        return [groups, keys];
    }, [getContents, currentProjection, isPreview]);

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
        if (isPreview) return;
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
    }, [goToGroup, isPreview, register, unregister]);

    return (
        <div className="flex h-full w-full flex-col overflow-hidden">
            <ScrollArea className="h-full w-full *:scroll-pt-20">
                <div className="flex h-full flex-col gap-2">
                    {groupedKeys.map((g, i) => (
                        <ContentQueueGroup
                            key={i}
                            index={i}
                            g={g}
                            items={grouped[g]!}
                        />
                    ))}
                </div>
            </ScrollArea>
        </div>
    );
});

const ContentQueueGroup = memo(function ContentQueueGroup({
    index,
    g,
    items,
}: {
    index: number;
    g: string;
    items: (ProjectionItem & {
        index: number;
    })[];
}) {
    return (
        <div className="flex w-full flex-col gap-2">
            <div className="flex flex-row items-center gap-3">
                <KbdGroup>
                    <Kbd>{index + 1}</Kbd>
                </KbdGroup>
                <span className="font-semibold">{g}</span>
            </div>
            <div className="before:bg-accent/80 relative flex flex-col gap-2 before:absolute before:top-2 before:bottom-2 before:left-0 before:-z-10 before:w-0.75 before:rounded-full">
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
    const element = useRef<HTMLButtonElement>(null);

    if (isActive) {
        element.current?.scrollIntoView({
            block: "start",
            inline: "nearest",
            behavior: "smooth",
        });
    }

    return (
        <Button
            ref={element}
            className={cn(
                "relative justify-start overflow-hidden rounded-md text-left text-ellipsis",
                "before:bg-brand before:absolute before:top-full before:bottom-full before:left-0 before:z-[1] before:w-0.75 before:rounded-full before:transition-all before:duration-133 before:ease-out",
                {
                    "bg-accent/80 text-accent-foreground before:top-2.5 before:bottom-2.5":
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
