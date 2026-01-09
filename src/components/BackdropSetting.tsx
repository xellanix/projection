import {
    FrameContainer,
    FrameDescription,
    FrameHeader,
} from "@/components/SettingsDialog";
import { Button } from "@/components/ui/button";
import {
    Item,
    ItemActions,
    ItemContent,
    ItemDescription,
    ItemGroup,
    ItemTitle,
} from "@/components/ui/item";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    ColorPicker,
    ColorPickerAlpha,
    ColorPickerFormat,
    ColorPickerHue,
    ColorPickerOutput,
    ColorPickerSelection,
} from "@/components/ui/shadcn-io/color-picker";
import { useSettingsStore } from "@/stores/settings.store";
import Color from "color";
import { memo, useCallback, useDeferredValue } from "react";
import { useShallow } from "zustand/react/shallow";

export const BackdropSetting = memo(function BackdropSetting() {
    return (
        <FrameContainer>
            <FrameHeader>
                <FrameDescription>
                    Change the color of the projection backdrop screen.
                </FrameDescription>
            </FrameHeader>

            <ItemGroup className="*:not-first:rounded-t-none *:not-first:border-t-0 *:not-last:rounded-b-none">
                <Item variant={"outline"}>
                    <ItemContent>
                        <ItemTitle>Color</ItemTitle>
                        <ItemDescription>
                            The color of the projection backdrop screen.
                        </ItemDescription>
                    </ItemContent>
                    <ColorSelector />
                </Item>
            </ItemGroup>
        </FrameContainer>
    );
});

const ColorSelector = memo(function ColorSelector() {
    const [color, set] = useSettingsStore(
        useShallow((s) => [s.temp.backdrop.color, s.set]),
    );
    const deferredColor = useDeferredValue(color);

    const onChange = useCallback(
        (value: Parameters<typeof Color.rgb>[0]) => {
            set((s) => {
                s.temp.backdrop.color = Color(value).hexa();
            });
        },
        [set],
    );

    return (
        <ItemActions>
            <div
                className="size-8 rounded-sm"
                style={{ backgroundColor: deferredColor }}
            />
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant={"outline"}>Change</Button>
                </PopoverTrigger>
                <PopoverContent
                    align="end"
                    className="min-h-32 max-w-sm min-w-76"
                >
                    <ColorPicker defaultValue={color} onChange={onChange}>
                        <ColorPickerSelection className="aspect-square w-full" />
                        <div className="flex items-center gap-4">
                            <div className="grid w-full gap-1">
                                <ColorPickerHue />
                                <ColorPickerAlpha />
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <ColorPickerOutput />
                            <ColorPickerFormat />
                        </div>
                    </ColorPicker>
                </PopoverContent>
            </Popover>
        </ItemActions>
    );
});
