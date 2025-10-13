"use client";

import { BrandIcon } from "@/components/Brand";
import { ContentResizer } from "@/components/ContentResizer";
import { Button } from "@/components/ui/button";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useGlobalKeyboard } from "@/context/GlobalKeyboardContext";
import { useProjection } from "@/context/ProjectionContext";
import { cn } from "@/lib/utils";
import { ArrowRight01Icon } from "@hugeicons-pro/core-stroke-rounded";
import { HugeiconsIcon } from "@hugeicons/react";
import { memo, useCallback, useEffect } from "react";

interface ProjectionQueueProps {
    currentProjection: number;
    setCurrentProjection: React.Dispatch<React.SetStateAction<number>>;
    setCurrentIndex: React.Dispatch<React.SetStateAction<number>>;
}
export const ProjectionQueue = memo(function ProjectionQueue({
    currentProjection,
    setCurrentProjection,
    setCurrentIndex,
}: ProjectionQueueProps) {
    const projections = useProjection();

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
        <div className="flex h-full flex-col gap-2 py-4">
            <span className="px-7 text-lg font-semibold">Queue</span>

            <div className="flex-1 overflow-hidden">
                <ScrollArea className="h-full w-full px-4">
                    {projections.map((p, i) => (
                        <Collapsible
                            key={i}
                            className="group/collapsible flex flex-col"
                        >
                            <div
                                className={cn(
                                    "relative flex flex-row rounded-md",
                                    "before:bg-brand before:absolute before:top-full before:bottom-full before:left-0 before:z-[1] before:w-0.75 before:rounded-full before:transition-[top,bottom] before:duration-133 before:ease-out",
                                    {
                                        "bg-sidebar-accent/50 before:top-2.5 before:bottom-2.5":
                                            i === currentProjection,
                                    },
                                )}
                            >
                                <Button
                                    className="hover:bg-sidebar-accent active:bg-sidebar-accent hover:text-sidebar-accent-foreground active:text-sidebar-accent-foreground flex-1 justify-start rounded-md text-left"
                                    variant={"ghost"}
                                    size={"sm"}
                                    onClick={handleClick(i, 0)}
                                >
                                    {p.title}
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
                            <CollapsibleContent className="flex flex-col">
                                {p.contents.map((c, j) => (
                                    <Button
                                        key={j}
                                        className="hover:bg-sidebar-accent active:bg-sidebar-accent hover:text-sidebar-accent-foreground active:text-sidebar-accent-foreground before:bg-border relative justify-start overflow-hidden rounded-md pl-9 text-left text-ellipsis before:absolute before:top-0 before:bottom-full before:left-3 before:h-full before:w-0.5"
                                        variant={"ghost"}
                                        size={"sm"}
                                        onClick={handleClick(i, j)}
                                    >
                                        {c.content}
                                    </Button>
                                ))}
                            </CollapsibleContent>
                        </Collapsible>
                    ))}
                </ScrollArea>
            </div>

            <div className="px-7 py-2 h-12">
                <ContentResizer className="h-full w-full">
                    <BrandIcon />
                </ContentResizer>
            </div>
        </div>
    );
});
