import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Toggle } from "@/components/ui/toggle";
import { useEcoStore } from "@/stores/eco.store";
import { Idea01Icon, Leaf01Icon } from "@hugeicons-pro/core-stroke-rounded";
import { HugeiconsIcon } from "@hugeicons/react";
import { memo, useState } from "react";

export const EcoModeButton = memo(function EcoModeButton() {
    const { ecoMode, setEcoMode } = useEcoStore();
    const [openAlert, setOpenAlert] = useState(false);

    const toggleEco = () => (!ecoMode ? setOpenAlert(true) : setEcoMode(false));

    const continueEco = () => {
        setEcoMode(true);
        setOpenAlert(false);
    };

    return (
        <AlertDialog open={openAlert}>
            <AlertDialogTrigger asChild>
                <div className="flex size-full flex-col">
                    <Toggle
                        aria-label="Eco Mode"
                        className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground justify-start px-3"
                        pressed={ecoMode}
                        onPressedChange={toggleEco}
                    >
                        <HugeiconsIcon icon={Leaf01Icon} strokeWidth={2} />
                        Eco Mode
                    </Toggle>
                </div>
            </AlertDialogTrigger>

            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Enabling Eco Mode will prevent you from viewing all
                        video content through this controller page. Enabling
                        this mode will not affect the output display.
                    </AlertDialogDescription>
                    <Alert className="mt-4">
                        <HugeiconsIcon icon={Idea01Icon} strokeWidth={1.75} />
                        <AlertTitle>Tip</AlertTitle>
                        <AlertDescription>
                            It is highly recommended to enable this mode on less
                            capable devices so that available resources can be
                            focused on the output display.
                        </AlertDescription>
                    </Alert>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setOpenAlert(false)}>
                        Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction onClick={continueEco}>
                        Continue
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
})
