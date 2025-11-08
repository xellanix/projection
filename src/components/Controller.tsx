"use client";

import { ButtonGroup, ButtonGroupText } from "@/components/ui/button-group";
import { Viewer } from "@/components/Viewer";
import React, { memo, useCallback, useEffect, useState } from "react";
import {
    ArrowLeft01Icon,
    ArrowRight01Icon,
    FullScreenIcon,
    Video02Icon,
    VideoOffIcon,
} from "@hugeicons-pro/core-stroke-rounded";
import {
    Copy02Icon,
    ComputerRemoveIcon,
} from "@hugeicons-pro/core-solid-rounded";
import {
    IconButton,
    IconDropdownMenuItem,
    IconSplitButton,
    IconToggleButton,
} from "@/components/Buttons";
import { useGlobalKeyboard } from "@/context/GlobalKeyboardContext";
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable";
import { ProjectionContentQueue } from "@/components/ProjectionQueue";
import { useSocketStore } from "@/stores/socket.store";
import { useShallow } from "zustand/react/shallow";
import { Separator } from "@/components/ui/separator";
import { mod } from "@/lib/utils";
import { useControl } from "@/context/ControlContext";
import { usePreview } from "@/context/PreviewContext";
import { Sidebar } from "@/components/Sidebar";
import { LiveMessageButton } from "@/components/LiveMessageButton";
import { useSettingsStore } from "@/stores/settings.store";

const NavButton = memo(function NavButton({
    type,
    isPreviewMode,
}: {
    type: "next" | "prev";
    isPreviewMode: boolean;
}) {
    const move = useControl((s) => s.moveIndex);

    return (
        <ButtonGroup>
            <IconButton
                label={type === "prev" ? "Previous Slide" : "Next Slide"}
                icon={type === "prev" ? ArrowLeft01Icon : ArrowRight01Icon}
                iconStrokeWidth={2.5}
                onClick={move(type === "prev" ? -1 : 1)}
                accelerator={{
                    key: type === "prev" ? "ArrowLeft" : "ArrowRight",
                    shift: isPreviewMode,
                }}
            />
        </ButtonGroup>
    );
});
const SlideIndex = memo(function SlideIndex() {
    const [currentIndex, maxIndex] = useControl(
        useShallow((s) => [s.currentIndex, s.maxIndex]),
    );

    return (
        <ButtonGroup>
            <ButtonGroupText className="border-none bg-transparent p-2 text-center shadow-none">
                Slide {currentIndex + 1} of {maxIndex + 1}
            </ButtonGroupText>
        </ButtonGroup>
    );
});

export const SlideController = memo(function SlideController() {
    const { isPreview } = usePreview();
    const setCurrentIndex = useControl((s) => s.setCurrentIndex);

    const [register, unregister] = useGlobalKeyboard();
    useEffect(() => {
        for (let i = 0; i < 10; i++) {
            register(`Digit${mod(i + 1, 10)}`, () => setCurrentIndex(i));
            register(`Numpad${mod(i + 1, 10)}`, () => setCurrentIndex(i));
        }

        return () => {
            for (let i = 0; i < 10; i++) {
                unregister(`Digit${i}`);
                unregister(`Numpad${i}`);
            }
        };
    }, [register, unregister, setCurrentIndex]);

    return (
        <ButtonGroup aria-label="Slide Navigation">
            <NavButton type="prev" isPreviewMode={isPreview} />
            <SlideIndex />
            <NavButton type="next" isPreviewMode={isPreview} />
        </ButtonGroup>
    );
});

const OnScreenManipulator = memo(function OnScreenManipulator() {
    const socket = useSocketStore((s) => s.socket);
    const [isBlack, isClear] = useSettingsStore(
        useShallow((s) => [s.local.screen.black, s.local.screen.clear]),
    );

    const openFullscreenView = useCallback(() => {
        window.open("/view", "_blank", "noopener,noreferrer");
    }, []);

    // Send special screen commands
    const specialScreen = useCallback(
        (type: string) => (pressed: boolean) => {
            socket?.emit("client:caster:specialScreen:set", type, pressed);
        },
        [socket],
    );

    return (
        <ButtonGroup aria-label="Slide Manipulations">
            <ButtonGroup className="@max-lg/screen:opacity-100 [&>*:not(:first-child)>*]:rounded-l-none [&>*:not(:first-child)>*]:border-l-0 [&>*:not(:last-child)>*]:rounded-r-none">
                <IconToggleButton
                    label="Black Screen"
                    icon={ComputerRemoveIcon}
                    iconStrokeWidth={0}
                    text="Black"
                    textClassName="@max-xl/screen:hidden"
                    accelerator={{ shift: true, key: "B" }}
                    pressed={isBlack}
                    onPressed={specialScreen("black")}
                />
                <IconToggleButton
                    label="Clear Screen"
                    icon={Copy02Icon}
                    iconStrokeWidth={0}
                    text="Clear"
                    textClassName="@max-xl/screen:hidden"
                    accelerator={{ shift: true, key: "C" }}
                    pressed={isClear}
                    onPressed={specialScreen("clear")}
                />
            </ButtonGroup>

            <ButtonGroup>
                <LiveMessageButton />
            </ButtonGroup>

            <ButtonGroup>
                <IconButton
                    label="Full Screen"
                    icon={FullScreenIcon}
                    text="Full Screen"
                    textClassName="@max-md/screen:hidden"
                    accelerator={{ shift: true, key: "F" }}
                    onClick={openFullscreenView}
                />
            </ButtonGroup>
        </ButtonGroup>
    );
});

const IndexSender = memo(function IndexSender({
    isLoaded,
}: {
    isLoaded: boolean;
}) {
    const [currentProjection, currentIndex] = useControl(
        useShallow((s) => [s.currentProjection, s.currentIndex]),
    );
    const socket = useSocketStore((s) => s.socket);

    // Update the server with the current index
    useEffect(() => {
        if (!isLoaded) return;
        socket?.emit(
            "client:caster:index:update",
            currentProjection,
            currentIndex,
        );
    }, [currentIndex, socket, isLoaded, currentProjection]);

    return null;
});

interface OnScreenSlideControllerProps {
    children: React.ReactNode;
}
export const OnScreenSlideController = memo(function OnScreenSlideController({
    children,
}: OnScreenSlideControllerProps) {
    const setCurrent = useControl((s) => s.setCurrent);
    const socket = useSocketStore((s) => s.socket);
    const [isLoaded, setIsLoaded] = useState(false);
    const setScreen = useSettingsStore((s) => s.setScreen);

    // Init the index and listen for updates from the server
    useEffect(() => {
        if (!socket) return;
        const updateIndex = setCurrent;
        const sync = (specialScreen: Record<string, boolean>) => {
            setScreen(specialScreen);
        };

        socket.emit(
            "client:screen:index:init",
            (
                projectionIndex: number,
                index: number,
                _: number,
                specialScreen: Record<string, boolean>,
            ) => {
                updateIndex(projectionIndex, index);
                setScreen(specialScreen);
                setIsLoaded(true);
            },
        );
        socket.on("server:screen:index:update", updateIndex);
        socket.on("server:caster:specialScreen:sync", sync);

        return () => {
            socket.off("server:screen:index:update", updateIndex);
            socket.off("server:caster:specialScreen:sync", sync);
        };
    }, [setCurrent, setScreen, socket]);

    return (
        <div className="relative flex h-full flex-col items-center gap-4">
            <IndexSender isLoaded={isLoaded} />

            <span className="text-xl font-semibold">On Screen</span>

            <div
                className="relative h-64 min-h-64 w-full @max-sm:min-h-48"
                data-slot="viewer"
            >
                {children}
            </div>

            <div className="flex w-full flex-row justify-between gap-4">
                <SlideController />

                <OnScreenManipulator />
            </div>

            <Separator orientation="horizontal" />

            <ProjectionContentQueue />
        </div>
    );
});

const PreviewManipulator = memo(function PreviewManipulator({
    projectToScreen,
    stopProjection,
}: {
    projectToScreen: () => void;
    stopProjection: () => void;
}) {
    return (
        <IconSplitButton
            label="Project to Screen"
            icon={Video02Icon}
            text={"Project"}
            textClassName="@max-2xs/preview:hidden"
            onClick={projectToScreen}
            accelerator={{ key: "Enter" }}
            moreLabel="Projections"
        >
            <IconDropdownMenuItem
                label="Stop Projection"
                icon={VideoOffIcon}
                text="Stop Projection"
                onClick={stopProjection}
                accelerator={{ shift: true, key: "Enter" }}
            />
        </IconSplitButton>
    );
});

export const PreviewSlideController = memo(function PreviewSlideController() {
    const [setCurrent, emit, currentProjection, currentIndex] = useControl(
        useShallow((s) => [
            s.setCurrent,
            s.emit,
            s.currentProjection,
            s.currentIndex,
        ]),
    );

    useEffect(() => setCurrent(0, 0), [setCurrent]);

    const projectToScreen = useCallback(() => {
        emit("client:caster:index:update", (s) => [
            s.currentProjection,
            s.currentIndex,
            true,
        ]);
    }, [emit]);

    const stopProjection = useCallback(
        () => emit("client:caster:specialScreen:set", () => ["stopped", true]),
        [emit],
    );

    const [register, unregister] = useGlobalKeyboard();
    useEffect(() => {
        register("Enter", projectToScreen);
        register("Shift+Enter", stopProjection);

        return () => {
            unregister("Enter");
            unregister("Shift+Enter");
        };
    }, [projectToScreen, stopProjection, register, unregister]);

    return (
        <ResizablePanelGroup direction="horizontal">
            <ResizablePanel
                minSize={10}
                defaultSize={20}
                className="bg-sidebar text-sidebar-foreground"
            >
                <Sidebar />
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel
                defaultSize={40}
                className="@container/preview py-4 pl-4"
            >
                <div className="relative flex h-full flex-col items-center gap-4">
                    <span className="text-xl font-semibold">Preview</span>

                    <div
                        className="relative h-64 min-h-64 w-full @max-sm:min-h-48"
                        data-slot="viewer"
                    >
                        <Viewer
                            currentProjection={currentProjection}
                            currentIndex={currentIndex}
                        />
                    </div>

                    <div className="flex w-full flex-row justify-between gap-4">
                        <SlideController />

                        <PreviewManipulator
                            projectToScreen={projectToScreen}
                            stopProjection={stopProjection}
                        />
                    </div>

                    <Separator orientation="horizontal" />

                    <ProjectionContentQueue />
                </div>
            </ResizablePanel>
        </ResizablePanelGroup>
    );
});

export function ControllerRegister() {
    const [socket, socketId] = useSocketStore(
        useShallow((s) => [s.socket, s.socketId]),
    );

    useEffect(() => {
        if (!socket || !socketId) return;

        socket.emit("client:socket:register", socketId);

        return () => {
            socket.emit("client:socket:unregister", socketId);
        };
    }, [socket, socketId]);

    return null;
}
