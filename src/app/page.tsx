import {
    ControllerRegister,
    OnScreenSlideController,
    PreviewSlideController,
} from "@/components/Controller";
import { ControlPanel, SidebarPanel } from "@/components/ControlPanel";
import { Sidebar } from "@/components/Sidebar";
import {
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable";
import { OnScreenViewer } from "@/components/Viewer";
import { ControlProvider, SidebarControlSync } from "@/context/ControlContext";
import { GlobalKeyboardProvider } from "@/context/GlobalKeyboardContext";
import { PreviewProvider } from "@/context/PreviewContext";

export default function HomePage() {
    return (
        <main className="flex h-dvh w-dvw flex-row">
            <ControllerRegister />

            <GlobalKeyboardProvider>
                <ResizablePanelGroup direction="horizontal">
                    <SidebarPanel>
                        <Sidebar />
                    </SidebarPanel>

                    <ResizablePanel defaultSize={80} className="px-4 py-4">
                        <ControlPanel
                            preview={
                                <PreviewProvider>
                                    <ControlProvider>
                                        <SidebarControlSync />
                                        <PreviewSlideController />
                                    </ControlProvider>
                                </PreviewProvider>
                            }
                            onScreen={
                                <ControlProvider>
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
