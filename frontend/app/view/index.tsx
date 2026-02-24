import { ProjectionMutator, QueueReorder } from "@/components/ProjectionQueue";
import { ScreenRemapper } from "@/components/core/ScreenRemapper";
import { SettingsSync } from "@/components/stores/SettingsSync";
import { OnScreenViewer, SignalCatcher } from "@/components/Viewer";
import { ViewOnlyProvider } from "@/context/ViewOnlyContext";

export default function ViewerPage() {
    return (
        <ViewOnlyProvider>
            <SettingsSync />
            <ProjectionMutator />
            <QueueReorder />
            <ScreenRemapper>
                <SignalCatcher>
                    <OnScreenViewer />
                </SignalCatcher>
            </ScreenRemapper>
        </ViewOnlyProvider>
    );
}
