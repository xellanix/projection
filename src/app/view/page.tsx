import {
    ScreenRemapper,
    ScreenRemapperInit,
} from "@/components/ScreenRemapper";
import { OnScreenViewer, SignalCatcher } from "@/components/Viewer";
import { ControlProvider } from "@/context/ControlContext";
import { ViewOnlyProvider } from "@/context/ViewOnlyContext";

export default function ViewerPage() {
    return (
        <ViewOnlyProvider>
            <ScreenRemapperInit />
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
