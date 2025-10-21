import {
    OnScreenSlideController,
    PreviewSlideController,
    ControllerRegister,
} from "@/components/Controller";
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable";
import { OnScreenViewer } from "@/components/Viewer";
import { ControlProvider } from "@/context/ControlContext";
import { GlobalKeyboardProvider } from "@/context/GlobalKeyboardContext";
import { PreviewProvider } from "@/context/PreviewContext";

export default function HomePage() {
    return (
        <main className="flex h-dvh w-dvw flex-row">
            <ControllerRegister />

            <GlobalKeyboardProvider>
                <ResizablePanelGroup direction="horizontal" className="gap-4">
                    <ResizablePanel defaultSize={60}>
                        <PreviewProvider>
                            <ControlProvider>
                                <PreviewSlideController />
                            </ControlProvider>
                        </PreviewProvider>
                    </ResizablePanel>
                    <ResizableHandle />
                    <ResizablePanel
                        defaultSize={40}
                        className="@container/screen py-4 pr-4"
                    >
                        <ControlProvider>
                            <OnScreenSlideController>
                                <OnScreenViewer />
                            </OnScreenSlideController>
                        </ControlProvider>
                    </ResizablePanel>
                </ResizablePanelGroup>
            </GlobalKeyboardProvider>
        </main>
    );
}
