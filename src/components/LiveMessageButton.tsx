import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { Toggle } from "@/components/ui/toggle";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { useGlobalKeyboard } from "@/context/GlobalKeyboardContext";
import { useSettingsStore } from "@/stores/settings.store";
import { useSocketStore } from "@/stores/socket.store";
import { MaximizeScreenIcon } from "@hugeicons-pro/core-stroke-rounded";
import { HugeiconsIcon } from "@hugeicons/react";
import { memo, useCallback, useEffect, useState, type FormEvent } from "react";

interface MessageToggleProps {
    label: string;
    pressed?: boolean;
    onPressed: () => void;
}
const MessageToggle = memo(function MessageToggle({
    label,
    onPressed,
    pressed,
}: MessageToggleProps) {
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <div>
                    <Toggle
                        variant={"outline"}
                        size={"default"}
                        aria-label={label}
                        pressed={pressed}
                        onPressedChange={onPressed}
                    >
                        <HugeiconsIcon
                            icon={MaximizeScreenIcon}
                            strokeWidth={2}
                        />
                        <span>Message</span>
                    </Toggle>
                </div>
            </TooltipTrigger>
            <TooltipContent>
                <div className="flex items-center gap-2">
                    {label}
                    <KbdGroup>
                        <Kbd>Shift</Kbd>
                        <Kbd>M</Kbd>
                    </KbdGroup>
                </div>
            </TooltipContent>
        </Tooltip>
    );
});

export const LiveMessageButton = memo(function LiveMessageButton() {
    const socket = useSocketStore((s) => s.socket);
    const opened = useSettingsStore((s) => s.local.message.isOpen);
    const [openAlert, setOpenAlert] = useState(false);

    const serverToggle = useCallback(
        (isOpen: boolean, message?: string) => {
            socket?.emit(
                "client:caster:message:toggle",
                message ?? "",
                isOpen,
            );
        },
        [socket],
    );

    const toggleMessage = useCallback(
        () => (!opened ? setOpenAlert(true) : serverToggle(false)),
        [opened, serverToggle],
    );

    const handleSubmit = useCallback((ev: FormEvent<HTMLFormElement>) => {
        ev.preventDefault();
        const data = new FormData(ev.currentTarget);

        serverToggle(true, data.get("message") as string);
        setOpenAlert(false);
    }, [serverToggle]);

    const [register, unregister] = useGlobalKeyboard();
    useEffect(() => {
        const key = "Shift+M";

        register(key, toggleMessage);
        return () => {
            unregister(key);
        };
    }, [register, unregister, toggleMessage]);

    return (
        <Dialog open={openAlert}>
            <DialogTrigger asChild>
                <div className="flex size-full flex-col">
                    <MessageToggle
                        label="Live Message"
                        pressed={opened}
                        onPressed={toggleMessage}
                    />
                </div>
            </DialogTrigger>

            <DialogContent showCloseButton={false}>
                <form onSubmit={handleSubmit} className="grid gap-4">
                    <DialogHeader>
                        <DialogTitle>Show Live Message</DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col gap-4">
                        <Input
                            name="message"
                            type="text"
                            placeholder="Message"
                        />
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button
                                variant={"outline"}
                                onClick={() => setOpenAlert(false)}
                            >
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button type="submit">Show</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
});
