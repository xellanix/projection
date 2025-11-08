"use client";

import {
    Alert02Icon,
    CheckmarkCircle02Icon,
    InformationCircleIcon,
    MultiplicationSignCircleIcon,
} from "@hugeicons-pro/core-stroke-rounded";
import { HugeiconsIcon } from "@hugeicons/react";
import { Loader2Icon } from "lucide-react";
import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
    const { theme = "system" } = useTheme();

    return (
        <Sonner
            theme={theme as ToasterProps["theme"]}
            className="toaster group"
            icons={{
                success: (
                    <HugeiconsIcon
                        icon={CheckmarkCircle02Icon}
                        strokeWidth={2}
                        className="size-5"
                    />
                ),
                info: (
                    <HugeiconsIcon
                        icon={InformationCircleIcon}
                        strokeWidth={2}
                        className="size-5"
                    />
                ),
                warning: (
                    <HugeiconsIcon
                        icon={Alert02Icon}
                        strokeWidth={2}
                        className="size-5"
                    />
                ),
                error: (
                    <HugeiconsIcon
                        icon={MultiplicationSignCircleIcon}
                        strokeWidth={2}
                        className="size-5"
                    />
                ),
                loading: (
                    <Loader2Icon
                        className="size-5 animate-spin"
                        strokeWidth={2.25}
                    />
                ),
            }}
            style={
                {
                    "--normal-bg": "var(--popover)",
                    "--normal-text": "var(--popover-foreground)",
                    "--normal-border": "var(--border)",
                    "--success-bg": "var(--success)",
                    "--success-text": "var(--success-foreground)",
                    "--success-border": "var(--success-border)",
                    "--error-bg": "var(--error)",
                    "--error-text": "var(--error-foreground)",
                    "--error-border": "var(--error-border)",
                    "--warning-bg": "var(--warning)",
                    "--warning-text": "var(--warning-foreground)",
                    "--warning-border": "var(--warning-border)",
                    "--info-bg": "var(--info)",
                    "--info-text": "var(--info-foreground)",
                    "--info-border": "var(--info-border)",
                    "--border-radius": "var(--radius)",
                    fontFamily: "inherit",
                } as React.CSSProperties
            }
            {...props}
        />
    );
};

export { Toaster };
