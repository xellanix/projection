"use client";

import { ButtonGroup, ButtonGroupText } from "@/components/ui/button-group";
import { Viewer } from "@/components/Viewer";
import React, { useCallback, useEffect, useState } from "react";
import {
    ArrowLeft01Icon,
    ArrowRight01Icon,
    MaximizeScreenIcon,
    MirroringScreenIcon,
} from "@hugeicons-pro/core-stroke-rounded";
import {
    Copy02Icon,
    ComputerRemoveIcon,
} from "@hugeicons-pro/core-solid-rounded";
import { IconButton, IconToggleButton } from "@/components/Buttons";
import { useGlobalKeyboard } from "@/context/GlobalKeyboardContext";
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable";
import {
    ProjectionContentQueue,
    ProjectionQueue,
} from "@/components/ProjectionQueue";
import { useSocketStore } from "@/stores/socket.store";
import { useShallow } from "zustand/react/shallow";
import { Separator } from "@/components/ui/separator";
import { useProjectionStore } from "@/stores/projection.store";
import { mod } from "@/lib/utils";

interface SlideControllerProps {
    currentProjection: number;
    currentIndex: number;
    setCurrentIndex: React.Dispatch<React.SetStateAction<number>>;
    isPreviewMode: boolean;
}
export function SlideController({
    currentProjection,
    currentIndex,
    setCurrentIndex,
    isPreviewMode,
}: SlideControllerProps) {
    const projectionLength = useProjectionStore((s) => s.getProjectionLength)(
        currentProjection,
    );

    const move = useCallback(
        (delta: number) => () => {
            setCurrentIndex((prev) => mod(prev + delta, projectionLength));
        },
        [projectionLength, setCurrentIndex],
    );

    const goToIndex = useCallback(
        (index: number) => () => setCurrentIndex(mod(index, projectionLength)),
        [projectionLength, setCurrentIndex],
    );

    const [register, unregister] = useGlobalKeyboard();

    useEffect(() => {
        const previewKey = isPreviewMode ? "Shift+" : "";

        register(previewKey + "ArrowLeft", move(-1));
        register(previewKey + "ArrowRight", move(1));
        for (let i = 0; i < 10; i++) {
            register(`Digit${mod(i + 1, 10)}`, goToIndex(i));
            register(`Numpad${mod(i + 1, 10)}`, goToIndex(i));
        }

        return () => {
            unregister(previewKey + "ArrowLeft");
            unregister(previewKey + "ArrowRight");
            for (let i = 0; i < 10; i++) {
                unregister(`Digit${i}`);
                unregister(`Numpad${i}`);
            }
        };
    }, [move, register, unregister, isPreviewMode, goToIndex]);

    return (
        <ButtonGroup aria-label="Slide Navigation">
            <ButtonGroup>
                <IconButton
                    label="Previous Slide"
                    icon={ArrowLeft01Icon}
                    iconStrokeWidth={2.5}
                    onClick={move(-1)}
                    accelerator={{ key: "LeftArrow", shift: isPreviewMode }}
                />
            </ButtonGroup>
            <ButtonGroup>
                <ButtonGroupText className="border-none bg-transparent p-2 text-center shadow-none">
                    Slide {currentIndex + 1} of {projectionLength}
                </ButtonGroupText>
            </ButtonGroup>
            <ButtonGroup>
                <IconButton
                    label="Next Slide"
                    icon={ArrowRight01Icon}
                    iconStrokeWidth={2.5}
                    onClick={move(1)}
                    accelerator={{ key: "RightArrow", shift: isPreviewMode }}
                />
            </ButtonGroup>
        </ButtonGroup>
    );
}

interface OnScreenSlideControllerProps {
    children: React.ReactNode;
}
export function OnScreenSlideController({
    children,
}: OnScreenSlideControllerProps) {
    const [currentProjection, setCurrentProjection] = useState(0);
    const [currentIndex, setCurrentIndex] = useState(0);
    const socket = useSocketStore((s) => s.socket);
    const [isLoaded, setIsLoaded] = useState(false);

    // Init the index and listen for updates from the server
    useEffect(() => {
        if (!socket) return;
        const updateIndex = (projectionIndex: number, index: number) => {
            setCurrentProjection(projectionIndex);
            setCurrentIndex(index);
        };

        socket.emit(
            "client:screen:index:init",
            (projectionIndex: number, index: number) => {
                updateIndex(projectionIndex, index);
                setIsLoaded(true);
            },
        );
        socket.on("server:screen:index:update", updateIndex);

        return () => {
            socket.off("server:screen:index:update", updateIndex);
        };
    }, [socket]);

    // Update the server with the current index
    useEffect(() => {
        if (!isLoaded) return;
        socket?.emit(
            "client:caster:index:update",
            currentProjection,
            currentIndex,
        );
    }, [currentIndex, socket, isLoaded, currentProjection]);

    // Send special screen commands
    const specialScreen = useCallback(
        (type: string) => (pressed: boolean) => {
            socket?.emit("client:caster:specialScreen:set", type, pressed);
        },
        [socket],
    );

    const openFullscreenView = useCallback(() => {
        window.open("/view", "_blank", "noopener,noreferrer");
    }, []);

    const [register, unregister] = useGlobalKeyboard();
    useEffect(() => {
        register("Shift+F", openFullscreenView);

        return () => {
            unregister("Shift+F");
        };
    }, [openFullscreenView, register, unregister]);

    return (
        <div className="relative flex h-full flex-col items-center gap-4">
            <span className="text-xl font-semibold">On Screen</span>

            <div
                className="relative h-64 min-h-64 w-full @max-sm:min-h-48"
                data-slot="viewer"
            >
                {children}
            </div>

            <div className="flex w-full flex-row justify-between gap-4">
                <SlideController
                    currentProjection={currentProjection}
                    currentIndex={currentIndex}
                    setCurrentIndex={setCurrentIndex}
                    isPreviewMode={false}
                />

                <ButtonGroup aria-label="Slide Manipulations">
                    <ButtonGroup className="[&>*:not(:first-child)>*]:rounded-l-none [&>*:not(:first-child)>*]:border-l-0 [&>*:not(:last-child)>*]:rounded-r-none">
                        <IconToggleButton
                            label="Black Screen"
                            icon={ComputerRemoveIcon}
                            iconStrokeWidth={0}
                            text="Black"
                            textClassName="@max-lg/screen:hidden"
                            accelerator={{ shift: true, key: "B" }}
                            onPressed={specialScreen("black")}
                        />
                        <IconToggleButton
                            label="Clear Screen"
                            icon={Copy02Icon}
                            iconStrokeWidth={0}
                            text="Clear"
                            textClassName="@max-lg/screen:hidden"
                            accelerator={{ shift: true, key: "C" }}
                            onPressed={specialScreen("clear")}
                        />
                    </ButtonGroup>

                    <ButtonGroup>
                        <IconButton
                            label="Full Screen"
                            icon={MaximizeScreenIcon}
                            text="Full Screen"
                            textClassName="@max-sm/screen:hidden"
                            accelerator={{ shift: true, key: "F" }}
                            onClick={openFullscreenView}
                        />
                    </ButtonGroup>
                </ButtonGroup>
            </div>

            <Separator orientation="horizontal" />

            <ProjectionContentQueue
                currentProjection={currentProjection}
                currentIndex={currentIndex}
                setCurrentIndex={setCurrentIndex}
            />
        </div>
    );
}

export function PreviewSlideController() {
    const [currentProjection, setCurrentProjection] = useState(0);
    const [currentIndex, setCurrentIndex] = useState(0);
    const socket = useSocketStore((s) => s.socket);

    const projectToScreen = useCallback(() => {
        socket?.emit(
            "client:caster:index:update",
            currentProjection,
            currentIndex,
        );
    }, [socket, currentProjection, currentIndex]);

    const [register, unregister] = useGlobalKeyboard();
    useEffect(() => {
        register("Enter", projectToScreen);

        return () => {
            unregister("Enter");
        };
    }, [projectToScreen, register, unregister]);

    return (
        <ResizablePanelGroup direction="horizontal">
            <ResizablePanel
                minSize={10}
                defaultSize={20}
                className="bg-sidebar text-sidebar-foreground"
            >
                <ProjectionQueue
                    currentProjection={currentProjection}
                    setCurrentProjection={setCurrentProjection}
                    setCurrentIndex={setCurrentIndex}
                />
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
                        <SlideController
                            currentProjection={currentProjection}
                            currentIndex={currentIndex}
                            setCurrentIndex={setCurrentIndex}
                            isPreviewMode={true}
                        />

                        <IconButton
                            label="Project to Screen"
                            icon={MirroringScreenIcon}
                            text={"Project"}
                            textClassName="@max-2xs/preview:hidden"
                            onClick={projectToScreen}
                            accelerator={{ key: "Enter" }}
                        />
                    </div>

                    <Separator orientation="horizontal" />

                    <ProjectionContentQueue
                        currentProjection={currentProjection}
                        currentIndex={currentIndex}
                        setCurrentIndex={setCurrentIndex}
                    />
                </div>
            </ResizablePanel>
        </ResizablePanelGroup>
    );
}

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
