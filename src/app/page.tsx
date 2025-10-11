import {
    OnScreenSlideController,
    PreviewSlideController,
} from "@/components/Controller";
import { Separator } from "@/components/ui/separator";
import { OnScreenViewer } from "@/components/Viewer";
import { GlobalKeyboardProvider } from "@/context/GlobalKeyboardContext";

export default function HomePage() {
    return (
        <main className="flex h-dvh w-dvw flex-row gap-4 p-4">
            <GlobalKeyboardProvider>
                <PreviewSlideController />
                <Separator orientation="vertical" />
                <OnScreenSlideController>
                    <OnScreenViewer />
                </OnScreenSlideController>
            </GlobalKeyboardProvider>
        </main>
    );
}
