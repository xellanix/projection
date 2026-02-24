import { DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { memo } from "react";
import { SettingsSync } from "@/components/stores/SettingsSync";
import {
    DialogFooter2,
    DialogSidebar,
    SidebarFrameBreadcrumb,
    SidebarFrameContent,
} from "@/components/dialogs/settings/client/SettingsDialog";

export const SettingsDialog = memo(function SettingsDialog() {
    return (
        <DialogContent className="overflow-hidden p-0 max-md:size-full max-md:!max-w-full md:h-[80dvh] md:max-h-[80dvh] md:max-w-[80dvw] lg:max-w-[90dvw]">
            <SettingsSync />
            <div className="flex flex-col overflow-hidden">
                <DialogTitle className="absolute opacity-0 select-none">
                    Settings
                </DialogTitle>
                <SidebarProvider className="size-full min-h-0">
                    <DialogSidebar />

                    <SidebarFrame />
                </SidebarProvider>
                <DialogFooter2 />
            </div>
        </DialogContent>
    );
});

function SidebarFrame() {
    return (
        <main className="flex size-full flex-col">
            <header className="bg-background flex shrink-0 items-center border-b">
                <SidebarTrigger className="m-2" />
                <Separator
                    orientation="vertical"
                    className="mr-2 data-[orientation=vertical]:h-4"
                />
                <SidebarFrameBreadcrumb />
            </header>
            <section className="flex size-full flex-col overflow-hidden">
                <ScrollArea className="size-full px-4">
                    <SidebarFrameContent />
                </ScrollArea>
            </section>
        </main>
    );
}
