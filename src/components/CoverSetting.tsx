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
import { useSettingsStore } from "@/stores/settings.store";
import { memo } from "react";

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
            </ItemGroup>
        </FrameContainer>
    );
});

const Preview = memo(function Preview() {
    const coverContent = useSettingsStore(
        ({ temp: { cover } }) => cover.content,
    );

    return (
        <ItemContent className="relative h-36 items-center justify-center overflow-hidden">
            <img
                src={coverContent}
                alt="Cover Screen"
                className="size-full object-contain"
            />
        </ItemContent>
    );
});

const CoverUpload = memo(function CoverUpload() {
    return <Button variant={"outline"}>Open</Button>;
});
