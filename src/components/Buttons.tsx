import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuShortcut,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { Toggle } from "@/components/ui/toggle";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { useGlobalKeyboard } from "@/context/GlobalKeyboardContext";
import { MoreHorizontalIcon } from "@hugeicons-pro/core-stroke-rounded";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import { useCallback, useEffect, useState } from "react";

interface BaseIconButtonProps {
    label: string;
    icon: IconSvgElement;
    iconStrokeWidth?: number;
    text?: string;
    textClassName?: string;
    accelerator?: {
        shift?: boolean;
        meta?: boolean;
        alt?: boolean;
        ctrl?: boolean;
        key: string;
    };
}

interface IconButtonProps extends BaseIconButtonProps {
    onClick?: () => void;
}
export function IconButton({
    label,
    icon,
    iconStrokeWidth,
    text,
    textClassName,
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
                    {text && <span className={textClassName}>{text}</span>}
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
    pressed?: boolean;
    onPressed: (pressed: boolean) => void;
}
export function IconToggleButton({
    label,
    icon,
    iconStrokeWidth,
    text,
    textClassName,
    onPressed,
    accelerator,
    ...props
}: IconToggleButtonProps) {
    const [pressed, setPressed] = useState(props.pressed ?? false);

    const togglePressed = useCallback(() => {
        setPressed((prev) => {
            onPressed(!prev);
            return !prev;
        });
    }, [onPressed]);

    useEffect(() => {
        setPressed(props.pressed ?? false);
    }, [props.pressed]);

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
                        {text && <span className={textClassName}>{text}</span>}
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

interface IconSplitButtonProps extends BaseIconButtonProps {
    onClick: () => void;
    children?: React.ReactNode;
    moreLabel?: string;
}
export function IconSplitButton({
    label,
    moreLabel,
    icon,
    iconStrokeWidth,
    text,
    textClassName,
    onClick,
    accelerator,
    children,
}: IconSplitButtonProps) {
    return (
        <ButtonGroup
            aria-label="Split Button"
            className="[&>*:not(:first-child)>*]:rounded-l-none [&>*:not(:first-child)>*]:border-l-0 [&>*:not(:last-child)>*]:rounded-r-none"
        >
            <IconButton
                label={label}
                icon={icon}
                iconStrokeWidth={iconStrokeWidth}
                text={text}
                textClassName={textClassName}
                onClick={onClick}
                accelerator={accelerator}
            />
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <div>
                        <IconButton
                            label="More Options"
                            icon={MoreHorizontalIcon}
                            iconStrokeWidth={3}
                        />
                    </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuLabel>
                        {moreLabel || "More Options"}
                    </DropdownMenuLabel>
                    {children}
                </DropdownMenuContent>
            </DropdownMenu>
        </ButtonGroup>
    );
}

export function IconDropdownMenuItem({
    label,
    icon,
    iconStrokeWidth,
    text,
    textClassName,
    onClick,
    accelerator,
}: IconButtonProps) {
    return (
        <DropdownMenuItem aria-label={label} onClick={onClick}>
            <HugeiconsIcon
                icon={icon}
                strokeWidth={iconStrokeWidth ?? 2}
                className="text-foreground"
            />
            <span className={textClassName}>{text}</span>

            {accelerator && (
                <DropdownMenuShortcut>
                    <KbdGroup>
                        {accelerator.shift && <Kbd>Shift</Kbd>}
                        {accelerator.meta && <Kbd>Meta</Kbd>}
                        {accelerator.alt && <Kbd>Alt</Kbd>}
                        {accelerator.ctrl && <Kbd>Ctrl</Kbd>}
                        <Kbd>{accelerator.key}</Kbd>
                    </KbdGroup>
                </DropdownMenuShortcut>
            )}
        </DropdownMenuItem>
    );
}
