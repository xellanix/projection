import { OnScreenViewer, SignalCatcher } from "@/components/Viewer";
import { ControlProvider } from "@/context/ControlContext";

export default function ViewerPage() {
    return (
        <SignalCatcher>
            <ControlProvider>
                <OnScreenViewer />
            </ControlProvider>
        </SignalCatcher>
    );
}
