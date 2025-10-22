import { OnScreenViewer, SignalCatcher } from "@/components/Viewer";
import { ControlProvider } from "@/context/ControlContext";
import { ViewOnlyProvider } from "@/context/ViewOnlyContext";

export default function ViewerPage() {
    return (
        <ViewOnlyProvider>
            <SignalCatcher>
                <ControlProvider>
                    <OnScreenViewer />
                </ControlProvider>
            </SignalCatcher>
        </ViewOnlyProvider>
    );
}
