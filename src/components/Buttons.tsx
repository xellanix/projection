import { Button } from "@/components/ui/button";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { Toggle } from "@/components/ui/toggle";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { useGlobalKeyboard } from "@/context/GlobalKeyboardContext";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import { useCallback, useEffect, useState } from "react";

interface BaseIconButtonProps {
    label: string;
    icon: IconSvgElement;
    iconStrokeWidth?: number;
    text?: string;
    accelerator?: {
        shift?: boolean;
        meta?: boolean;
        alt?: boolean;
        ctrl?: boolean;
        key: string;
    };
}

interface IconButtonProps extends BaseIconButtonProps {
    onClick: () => void;
}
export function IconButton({
    label,
    icon,
    iconStrokeWidth,
    text,
    onClick,
    accelerator,
}: IconButtonProps) {
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Button
                    variant={"outline"}
                    size={text ? "default" : "icon"}
                    aria-label={label}
                    onClick={onClick}
                >
                    <HugeiconsIcon
                        icon={icon}
                        strokeWidth={iconStrokeWidth ?? 2}
                    />
                    {text}
                </Button>
            </TooltipTrigger>
            <TooltipContent>
                <div className="flex items-center gap-2">
                    {label}
                    {accelerator && (
                        <KbdGroup>
                            {accelerator.shift && <Kbd>Shift</Kbd>}
                            {accelerator.meta && <Kbd>Meta</Kbd>}
                            {accelerator.alt && <Kbd>Alt</Kbd>}
                            {accelerator.ctrl && <Kbd>Ctrl</Kbd>}
                            <Kbd>{accelerator.key}</Kbd>
                        </KbdGroup>
                    )}
                </div>
            </TooltipContent>
        </Tooltip>
    );
}

interface IconToggleButtonProps extends BaseIconButtonProps {
    onPressed: (pressed: boolean) => void;
}
export function IconToggleButton({
    label,
    icon,
    iconStrokeWidth,
    text,
    onPressed,
    accelerator,
}: IconToggleButtonProps) {
    const [pressed, setPressed] = useState(false);

    const togglePressed = useCallback(() => {
        setPressed((prev) => {
            onPressed(!prev);
            return !prev;
        });
    }, [onPressed]);

    const [register, unregister] = useGlobalKeyboard();
    useEffect(() => {
        if (accelerator) {
            const key = `${accelerator.shift ? "Shift+" : ""}${
                accelerator.meta ? "Meta+" : ""
            }${accelerator.alt ? "Alt+" : ""}${
                accelerator.ctrl ? "Ctrl+" : ""
            }${accelerator.key}`;

            register(key, togglePressed);
            return () => {
                unregister(key);
            };
        }
    }, [accelerator, register, unregister, togglePressed]);

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <div>
                    <Toggle
                        variant={"outline"}
                        size={"default"}
                        aria-label={label}
                        pressed={pressed}
                        onPressedChange={togglePressed}
                    >
                        <HugeiconsIcon
                            icon={icon}
                            strokeWidth={iconStrokeWidth ?? 2}
                        />
                        {text}
                    </Toggle>
                </div>
            </TooltipTrigger>
            <TooltipContent>
                <div className="flex items-center gap-2">
                    {label}
                    {accelerator && (
                        <KbdGroup>
                            {accelerator.shift && <Kbd>Shift</Kbd>}
                            {accelerator.meta && <Kbd>Meta</Kbd>}
                            {accelerator.alt && <Kbd>Alt</Kbd>}
                            {accelerator.ctrl && <Kbd>Ctrl</Kbd>}
                            <Kbd>{accelerator.key}</Kbd>
                        </KbdGroup>
                    )}
                </div>
            </TooltipContent>
        </Tooltip>
    );
}
