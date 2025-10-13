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
                            <PreviewSlideController />
                        </PreviewProvider>
                    </ResizablePanel>
                    <ResizableHandle />
                    <ResizablePanel defaultSize={40} className="py-4 pr-4">
                        <OnScreenSlideController>
                            <OnScreenViewer />
                        </OnScreenSlideController>
                    </ResizablePanel>
                </ResizablePanelGroup>
            </GlobalKeyboardProvider>
        </main>
    );
}
