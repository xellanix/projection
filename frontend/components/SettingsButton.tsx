import { SettingsDialog } from "@/components/dialogs/settings/SettingsDialog";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Settings02Icon } from "@hugeicons-pro/core-stroke-rounded";
import { HugeiconsIcon } from "@hugeicons/react";
import { memo } from "react";

export const SettingsButton = memo(function SettingsButton() {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button
                    aria-label="Settings"
                    variant={"ghost"}
                    className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground justify-start"
                >
                    <HugeiconsIcon icon={Settings02Icon} strokeWidth={2} />
                    Settings
                </Button>
            </DialogTrigger>

            <SettingsDialog />
        </Dialog>
    );
});
