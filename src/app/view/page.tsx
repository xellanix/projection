import { ScreenRemapper } from "@/components/ScreenRemapper";
import { SettingsSync } from "@/components/stores/SettingsSync";
import { OnScreenViewer, SignalCatcher } from "@/components/Viewer";
import { ControlProvider } from "@/context/ControlContext";
import { ViewOnlyProvider } from "@/context/ViewOnlyContext";

export default function ViewerPage() {
    return (
        <ViewOnlyProvider>
            <SettingsSync />
            <ScreenRemapper>
                <SignalCatcher>
                    <ControlProvider>
                        <OnScreenViewer />
                    </ControlProvider>
                </SignalCatcher>
            </ScreenRemapper>
        </ViewOnlyProvider>
    );
}
