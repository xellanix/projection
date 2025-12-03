"use client";

import { Button } from "@/components/ui/button";
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable";
import { useIsMobile } from "@/hooks/use-mobile";
import {
    ArrowLeft01Icon,
    ArrowRight01Icon,
} from "@hugeicons-pro/core-stroke-rounded";
import { HugeiconsIcon } from "@hugeicons/react";
import React, { memo, useEffect, useRef, useState } from "react";
import type { ImperativePanelHandle } from "react-resizable-panels";

export const SidebarPanel = memo(function SidebarPanel({
    children,
}: {
    children: React.ReactNode;
}) {
    const isMobile = useIsMobile();
    const sidePanel = useRef<ImperativePanelHandle>(null);
    const [isExpanded, setIsExpanded] = useState<boolean>(true);

    const onToggle = () => {
        if (!sidePanel.current) return;

        if (sidePanel.current.isExpanded()) sidePanel.current.collapse();
        else sidePanel.current.expand();
    };

    useEffect(() => {
        if (isMobile) {
            sidePanel.current?.resize(85);
            sidePanel.current?.collapse();
        } else {
            sidePanel.current?.resize(20);
            sidePanel.current?.expand();
        }
    }, [isMobile]);

    return (
        <>
            <ResizablePanel
                ref={sidePanel}
                minSize={10}
                defaultSize={20}
                collapsible
                className="bg-sidebar text-sidebar-foreground relative"
                onCollapse={() => setIsExpanded(false)}
                onExpand={() => setIsExpanded(true)}
            >
                {children}
            </ResizablePanel>
            <div className="relative flex h-full flex-row">
                <ResizableHandle />
                <Button
                    variant={"outline"}
                    size={"icon-sm"}
                    tabIndex={-1}
                    className="bg-sidebar hover:bg-sidebar-accent active:bg-sidebar-accent hover:text-sidebar-accent-foreground active:text-sidebar-accent-foreground absolute top-4 left-full z-10 rounded-l-none border-l-0 !px-2 py-0"
                    aria-label="Collapse"
                    onClick={onToggle}
                >
                    <HugeiconsIcon
                        icon={ArrowRight01Icon}
                        altIcon={ArrowLeft01Icon}
                        showAlt={isExpanded}
                        strokeWidth={2.5}
                    />
                </Button>
            </div>
        </>
    );
});

interface ControlPanelProps {
    preview: React.ReactNode;
    onScreen: React.ReactNode;
}
export const ControlPanel = memo(function ControlPanel({
    preview,
    onScreen,
}: ControlPanelProps) {
    const isMobile = useIsMobile();
    const onScreenPanel = useRef<ImperativePanelHandle>(null);

    useEffect(() => {
        if (isMobile) onScreenPanel.current?.resize(70);
        else onScreenPanel.current?.resize(50);
    });

    return (
        <ResizablePanelGroup
            direction={isMobile ? "vertical" : "horizontal"}
            className="gap-4"
        >
            <ResizablePanel defaultSize={40} className="@container/preview">
                {preview}
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel
                ref={onScreenPanel}
                defaultSize={40}
                className="@container/screen"
            >
                {onScreen}
            </ResizablePanel>
        </ResizablePanelGroup>
    );
});
