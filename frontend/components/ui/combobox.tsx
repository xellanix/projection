import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
    ArrowDown01Icon,
    Tick02Icon,
} from "@hugeicons-pro/core-stroke-rounded";
import { HugeiconsIcon } from "@hugeicons/react";
import { memo, useEffect, useMemo, useState } from "react";

interface ComboboxProps<T> {
    data: T[];
    dataKey: (item: T) => string;
    dataValue: (item: T) => string;
    defaultValue?: string;
    value?: string;
    onChange?: (value: string) => void;
    className?: {
        button?: string;
        content?: string;
    };
    canSearch?: boolean;
    placeholder: string;
}

function ComboboxR<T>({
    data,
    dataKey,
    dataValue,
    defaultValue,
    onChange,
    className,
    canSearch,
    placeholder,
    ...props
}: ComboboxProps<T>) {
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState(defaultValue || "");

    const buttonText = useMemo(() => {
        if (!value) return placeholder;

        const item = data.find((item) => dataKey(item) === value);
        return item ? dataValue(item) : "Unlisted";
    }, [value, placeholder, data, dataValue, dataKey]);

    useEffect(() => {
        setValue(props.value ?? placeholder);
    }, [placeholder, props.value]);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger
                role="combobox"
                aria-expanded={open}
                className={cn("w-[200px] justify-between", className?.button)}
                asChild
            >
                <Button variant="outline">
                    {buttonText}
                    <HugeiconsIcon
                        icon={ArrowDown01Icon}
                        strokeWidth={2.5}
                        className="opacity-50"
                    />
                </Button>
            </PopoverTrigger>
            <PopoverContent className={cn("w-[200px] p-0", className?.content)}>
                <Command>
                    {canSearch && (
                        <CommandInput placeholder="Search..." className="h-9" />
                    )}
                    <CommandList>
                        <CommandEmpty>No option found.</CommandEmpty>
                        <CommandGroup>
                            {data.map((item) => (
                                <CommandItem
                                    key={dataKey(item)}
                                    value={dataKey(item)}
                                    onSelect={(currentValue) => {
                                        setValue(currentValue);
                                        onChange?.(currentValue);
                                        setOpen(false);
                                    }}
                                >
                                    {dataValue(item)}
                                    <HugeiconsIcon
                                        icon={Tick02Icon}
                                        strokeWidth={2.5}
                                        className={cn(
                                            "ml-auto",
                                            value === dataKey(item)
                                                ? "opacity-100"
                                                : "opacity-0",
                                        )}
                                    />
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}

export const Combobox = memo(ComboboxR) as typeof ComboboxR;
