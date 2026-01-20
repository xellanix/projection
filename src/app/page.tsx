import {
    ControllerRegister,
    OnScreenSlideController,
    PreviewSlideController,
} from "@/components/Controller";
import { ControlPanel, SidebarPanel } from "@/components/ControlPanel";
import {
    PreviewQueueReorder,
    ProjectionMutator,
} from "@/components/ProjectionQueue";
import { Sidebar } from "@/components/Sidebar";
import { ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { OnScreenViewer } from "@/components/Viewer";
import {
    ControlProvider,
    MaxProjectionSync,
    SidebarControlSync,
} from "@/context/ControlContext";
import { GlobalKeyboardProvider } from "@/context/GlobalKeyboardContext";
import { PreviewProvider } from "@/context/PreviewContext";

export default function HomePage() {
    return (
        <main className="flex h-dvh min-h-[48rem] w-dvw flex-row">
            <ControllerRegister />
            <ProjectionMutator />

            <GlobalKeyboardProvider>
                <ResizablePanelGroup direction="horizontal">
                    <SidebarPanel>
                        <PreviewQueueReorder />
                        <Sidebar />
                    </SidebarPanel>

                    <ResizablePanel
                        defaultSize={80}
                        collapsible
                        className="px-4 py-2 lg:py-4"
                    >
                        <ControlPanel
                            preview={
                                <PreviewProvider>
                                    <ControlProvider>
                                        <SidebarControlSync />
                                        <MaxProjectionSync />
                                        <PreviewSlideController />
                                    </ControlProvider>
                                </PreviewProvider>
                            }
                            onScreen={
                                <ControlProvider>
                                    <MaxProjectionSync />
                                    <OnScreenSlideController>
                                        <OnScreenViewer />
                                    </OnScreenSlideController>
                                </ControlProvider>
                            }
                        />
                    </ResizablePanel>
                </ResizablePanelGroup>
            </GlobalKeyboardProvider>
        </main>
    );
}
