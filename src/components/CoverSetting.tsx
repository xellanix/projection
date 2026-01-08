import {
    FrameContainer,
    FrameDescription,
    FrameHeader,
} from "@/components/SettingsDialog";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import {
    Item,
    ItemActions,
    ItemContent,
    ItemDescription,
    ItemGroup,
    ItemTitle,
} from "@/components/ui/item";
import { useSettingsStore } from "@/stores/settings.store";
import { memo, useCallback } from "react";
import { useShallow } from "zustand/react/shallow";

export const CoverSetting = memo(function CoverSetting() {
    /* const changeCurrent = () => {
        useSettingsStore.getState().set(({ temp }) => {
            temp.cover.type = "image";
            temp.cover.content = "";
        });
    }; */

    return (
        <FrameContainer>
            <FrameHeader>
                <FrameDescription>
                    Configure the projection cover screen regarding the content
                    to be displayed and the behavior to be applied.
                </FrameDescription>
            </FrameHeader>

            <Item variant={"outline"}>
                <Preview />
            </Item>

            <ItemGroup className="*:not-first:rounded-t-none *:not-first:border-t-0 *:not-last:rounded-b-none">
                <Item variant={"outline"}>
                    <ItemContent>
                        <ItemTitle>Cover Image</ItemTitle>
                        <ItemDescription>
                            The image to be used as the cover screen.
                        </ItemDescription>
                    </ItemContent>
                    <ItemActions>
                        <CoverUpload />
                    </ItemActions>
                </Item>
                <Item variant={"outline"}>
                    <ItemContent>
                        <ItemTitle>Scaling Strategy</ItemTitle>
                        <ItemDescription>
                            The scaling strategy for the cover screen onto the
                            projection.
                        </ItemDescription>
                    </ItemContent>
                    <ScaleAction />
                </Item>
            </ItemGroup>
        </FrameContainer>
    );
});

const Preview = memo(function Preview() {
    const [type, content, cn] = useSettingsStore(
        useShallow((s) => [
            s.temp.cover.type,
            s.temp.cover.content,
            "size-full " +
                (s.temp.cover.scaleStrategy === "fit"
                    ? "object-contain"
                    : "object-cover"),
        ]),
    );

    return (
        <ItemContent className="relative h-36 items-center justify-center overflow-hidden">
            {type === "image" ? (
                <img src={content} alt="Cover Screen" className={cn} />
            ) : type === "video" ? (
                <video
                    src={content}
                    muted
                    loop
                    autoPlay
                    preload="auto"
                    className={cn}
                />
            ) : null}
        </ItemContent>
    );
});

const CoverUpload = memo(function CoverUpload() {
    return <Button variant={"outline"}>Open</Button>;
});

const ScaleAction = memo(function ScaleAction() {
    const [strategy, set] = useSettingsStore(
        useShallow((s) => [s.temp.cover.scaleStrategy, s.set]),
    );

    const onChange = useCallback(
        (v: string) =>
            set((s) => {
                s.temp.cover.scaleStrategy = v as typeof strategy;
            }),
        [set],
    );

    return (
        <ItemActions>
            <Combobox
                data={[
                    {
                        value: "fit",
                        label: "Fit",
                    },
                    {
                        value: "fill",
                        label: "Fill",
                    },
                ]}
                dataKey={(i) => i.value}
                dataValue={(i) => i.label}
                defaultValue={strategy}
                value={strategy}
                onChange={onChange}
                placeholder="Select strategy"
                className={{ button: "w-36", content: "w-36" }}
            />
        </ItemActions>
    );
});
