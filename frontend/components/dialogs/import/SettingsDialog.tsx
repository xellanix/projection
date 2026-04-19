import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useImportSettingsStore } from "@/stores/import.settings.store";
import { useSettingsStore } from "@/stores/settings.store";
import { memo, useCallback } from "react";

const DialogRoot = memo(function DialogRoot({ children }: { children: React.ReactNode }) {
    const isAvailable = useImportSettingsStore((s) => s.isAvailable);
    const setIsAvailable = useImportSettingsStore((s) => s.setIsAvailable);

    return (
        <Dialog open={isAvailable} onOpenChange={setIsAvailable}>
            {children}
        </Dialog>
    );
});

export const SettingsDialog = memo(function SettingsDialog() {
    const importSettings = useCallback(() => {
        const data = useImportSettingsStore.getState().data;
        if (data) {
            useSettingsStore.setState((s) => {
                s.global = data;
                s.globalActivator = "client";
                Object.assign(s.temp, s.global);
            });
        }

        useImportSettingsStore.getState().setIsAvailable(false);
    }, []);

    return (
        <DialogRoot>
            <DialogContent
                showCloseButton={false}
                className="flex w-md flex-col gap-4 overflow-hidden px-0! py-6 *:px-6 max-md:max-w-[85dvw]! md:max-h-[80dvh] md:max-w-[80dvw] lg:max-w-[90dvw]"
            >
                <DialogHeader>
                    <DialogTitle>Import Settings</DialogTitle>
                    <DialogDescription>
                        A{" "}
                        <code className="bg-muted text-muted-foreground inline-flex h-5.5 items-center justify-center rounded-sm px-1 text-sm font-semibold">
                            settings.json
                        </code>{" "}
                        file was found within the projection file you added. Would you like to
                        import and apply these settings to your current project?
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter className="flex-row justify-end">
                    <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button onClick={importSettings}>Import</Button>
                </DialogFooter>
            </DialogContent>
        </DialogRoot>
    );
});
