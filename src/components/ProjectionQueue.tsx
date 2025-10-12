"use client";

import { Button } from "@/components/ui/button";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useProjection } from "@/context/ProjectionContext";
import { ArrowRight01Icon } from "@hugeicons-pro/core-stroke-rounded";
import { HugeiconsIcon } from "@hugeicons/react";
import { memo, useCallback } from "react";

interface ProjectionQueueProps {
    setCurrentProjection: React.Dispatch<React.SetStateAction<number>>;
    setCurrentIndex: React.Dispatch<React.SetStateAction<number>>;
}
export const ProjectionQueue = memo(function ProjectionQueue({
    setCurrentProjection,
    setCurrentIndex,
}: ProjectionQueueProps) {
    const projections = useProjection();

    const handleClick = useCallback(
        (projectionIndex: number, index: number) => () => {
            setCurrentProjection(projectionIndex);
            setCurrentIndex(index);
        },
        [setCurrentProjection, setCurrentIndex],
    );

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
                            <div className="flex flex-row">
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

            <div className="flex items-center gap-2 overflow-hidden px-7 py-2">
                <img
                    src="./favicon.svg"
                    alt="Xellanix icon"
                    className="size-7"
                />
                <h2 className="text-xl font-bold text-(--text-normal)">
                    Projection
                </h2>
            </div>
        </div>
    );
});
