import {
    FrameContainer,
    FrameDescription,
    FrameHeader,
} from "@/components/dialogs/settings/SettingsDialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuPortal,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
    Item,
    ItemActions,
    ItemContent,
    ItemDescription,
    ItemGroup,
    ItemTitle,
} from "@/components/ui/item";
import { getAspectRatio } from "@/lib/utils";
import { useSettingsStore } from "@/stores/settings.store";
import type { InputChangeEvent, Size } from "@/types";
import {
    ArrowDown01Icon,
    Idea01Icon,
} from "@hugeicons-pro/core-stroke-rounded";
import { HugeiconsIcon } from "@hugeicons/react";
import {
    Fragment,
    memo,
    useCallback,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { useShallow } from "zustand/react/shallow";

export const RemapSetting = memo(function RemapSetting() {
    return (
        <FrameContainer>
            <FrameHeader>
                <FrameDescription>
                    Remap the projection output to the actual screen aspect
                    ratio using custom resolutions and scaling strategy,
                    ensuring the content displays correctly.
                </FrameDescription>
                <Alert>
                    <HugeiconsIcon icon={Idea01Icon} strokeWidth={1.75} />
                    <AlertDescription>
                        This setting prevents the content stretching caused by a
                        screen resolution and aspect ratio mismatch.
                    </AlertDescription>
                </Alert>
            </FrameHeader>

            <Item variant={"outline"}>
                <Preview />
            </Item>

            <ItemGroup className="*:not-first:rounded-t-none *:not-first:border-t-0 *:not-last:rounded-b-none">
                <Item variant={"outline"}>
                    <ItemContent>
                        <ItemTitle>Output Resolution</ItemTitle>
                        <ItemDescription>
                            The projection output resolution.
                        </ItemDescription>
                    </ItemContent>
                    <ContentAction />
                </Item>
                <Item variant={"outline"}>
                    <ItemContent>
                        <ItemTitle>Screen Resolution</ItemTitle>
                        <ItemDescription>
                            The expected screen resolution (corresponding to the
                            aspect ratio).
                        </ItemDescription>
                    </ItemContent>
                    <ScreenAction />
                </Item>
                <Item variant={"outline"}>
                    <ItemContent>
                        <ItemTitle>Scaling Strategy</ItemTitle>
                        <ItemDescription>
                            The scaling strategy for the projection output onto
                            the screen.
                        </ItemDescription>
                    </ItemContent>
                    <ScaleAction />
                </Item>
            </ItemGroup>
        </FrameContainer>
    );
});

const getFitSize = (container: Size, content: Size): Size => {
    const contentWidth = content.width;
    const contentHeight = content.height;

    if (contentWidth === 0 || contentHeight === 0) {
        return { width: 0, height: 0 };
    }

    const scaleX = container.width / contentWidth;
    const scaleY = container.height / contentHeight;
    const newScale = Math.min(scaleX, scaleY);

    const newContentWidth = contentWidth * newScale;
    const newContentHeight = contentHeight * newScale;
    return {
        width: newContentWidth,
        height: newContentHeight,
    };
};

const Preview = memo(function Preview() {
    const [contentRes, screenRes, strategy] = useSettingsStore(
        useShallow(({ temp: { remap } }) => [
            remap.contentResolution,
            remap.screenResolution,
            remap.scaleStrategy,
        ]),
    );
    const contentAR = useMemo(() => getAspectRatio(contentRes), [contentRes]);
    const screenAR = useMemo(() => getAspectRatio(screenRes), [screenRes]);

    const containerRef = useRef<HTMLDivElement>(null);
    const [screenSize, setScreenSize] = useState<Size>({ width: 0, height: 0 });
    const [contentSize, setContentSize] = useState<Size>(screenSize);

    const handleResize = useCallback(() => {
        const container = containerRef.current;

        if (container) {
            const containerSize = {
                width: container.offsetWidth,
                height: container.offsetHeight,
            };

            if (strategy === "fit") {
                const screenFit = getFitSize(containerSize, screenAR);
                const contentFit = getFitSize(screenFit, contentAR);

                setScreenSize(screenFit);
                setContentSize(contentFit);
            } else {
                const contentFit = getFitSize(containerSize, contentAR);
                const screenFit = getFitSize(contentFit, screenAR);

                setScreenSize(screenFit);
                setContentSize(contentFit);
            }
        }
    }, [screenAR, contentAR, strategy]);

    useLayoutEffect(() => {
        // The ResizeObserver will handle all subsequent resizes.
        const observer = new ResizeObserver(handleResize);
        if (containerRef.current) observer.observe(containerRef.current);

        // Initial calculation
        handleResize();

        return () => {
            observer.disconnect();
        };
    }, [handleResize]);

    return (
        <ItemContent
            ref={containerRef}
            className="relative h-36 items-center justify-center overflow-hidden"
        >
            <div
                className="border-brand text-brand/80 absolute flex flex-col justify-end rounded-sm border-2 px-1 font-medium transition-all duration-133 ease-out"
                style={{
                    width: `${contentSize.width}px`,
                    height: `${contentSize.height}px`,
                }}
            >
                Output
            </div>
            <div
                className="absolute rounded-sm border-2 border-amber-500 bg-[repeating-linear-gradient(45deg,_color-mix(in_oklab,var(--color-amber-200)_80%,transparent)_0,_color-mix(in_oklab,var(--color-amber-200)_80%,transparent)_2px,_transparent_2px,_transparent_22px)] px-1 font-medium text-amber-500/80 transition-all duration-133 ease-out"
                style={{
                    width: `${screenSize.width}px`,
                    height: `${screenSize.height}px`,
                    zIndex: strategy === "fit" ? -1 : 1,
                }}
            >
                Screen
            </div>
        </ItemContent>
    );
});

const baseHandleResize = (ev: InputChangeEvent) => {
    const name = ev.currentTarget.name;
    const value = parseInt(ev.currentTarget.value);

    const k1 = name.startsWith("screen-")
        ? "screenResolution"
        : "contentResolution";
    const k2: keyof Size = name.endsWith("width") ? "width" : "height";

    useSettingsStore.getState().set(({ temp }) => {
        temp.remap[k1][k2] = value;
    });
};

const ContentAction = memo(function ContentAction() {
    const contentResolution = useSettingsStore(
        (s) => s.temp.remap.contentResolution,
    );

    return (
        <ResolutionInput
            {...contentResolution}
            type="content"
            onChange={baseHandleResize}
        />
    );
});

const ScreenAction = memo(function ScreenAction() {
    const screenResolution = useSettingsStore(
        (s) => s.temp.remap.screenResolution,
    );

    return (
        <ResolutionInput
            {...screenResolution}
            type="screen"
            onChange={baseHandleResize}
        />
    );
});

type ResolutionItem = {
    name: string;
    width: number;
    height: number;
};
const resolutions: { name: string; items: ResolutionItem[] }[] = [
    {
        name: "16:9",
        items: [
            { name: "HD", width: 1280, height: 720 },
            { name: "FHD", width: 1920, height: 1080 },
            { name: "QHD", width: 2560, height: 1440 },
            { name: "4K", width: 3840, height: 2160 },
            { name: "8K", width: 7680, height: 4320 },
        ],
    },
    {
        name: "21:9",
        items: [
            { name: "Ultrawide FHD", width: 2520, height: 1080 },
            { name: "Ultrawide QHD", width: 3360, height: 1440 },
            { name: "Ultrawide 4K", width: 5040, height: 2160 },
            { name: "Ultrawide 8K", width: 10080, height: 4320 },
        ],
    },
    {
        name: "16:10",
        items: [
            { name: "WXGA+", width: 1440, height: 900 },
            { name: "WSXGA+", width: 1680, height: 1050 },
            { name: "WUXGA", width: 1920, height: 1200 },
            { name: "WQXGA", width: 2560, height: 1600 },
        ],
    },
    {
        name: "4:3",
        items: [
            { name: "VGA", width: 640, height: 480 },
            { name: "SVGA", width: 800, height: 600 },
            { name: "XGA", width: 1024, height: 768 },
            { name: "QXGA", width: 2048, height: 1536 },
        ],
    },
    {
        name: "5:4",
        items: [{ name: "SXGA", width: 1280, height: 1024 }],
    },
    {
        name: "3:2",
        items: [
            { name: "1000p", width: 1500, height: 1000 },
            { name: "1280p", width: 1920, height: 1280 },
            { name: "1440p", width: 2160, height: 1440 },
            { name: "2000p", width: 3000, height: 2000 },
            { name: "2560p", width: 3840, height: 2560 },
            { name: "3000p", width: 4500, height: 3000 },
        ],
    },
    {
        name: "2:1",
        items: [
            { name: "FHD+", width: 2160, height: 1080 },
            { name: "QHD+", width: 2880, height: 1440 },
            { name: "4K+", width: 4320, height: 2160 },
        ],
    },
    {
        name: "19:9",
        items: [
            { name: "FHD+", width: 2280, height: 1080 },
            { name: "QHD+", width: 3040, height: 1440 },
            { name: "4K+", width: 4560, height: 2160 },
        ],
    },
    {
        name: "19.5:9",
        items: [
            { name: "FHD+", width: 2340, height: 1080 },
            { name: "QHD+", width: 3120, height: 1440 },
            { name: "4K+", width: 4680, height: 2160 },
        ],
    },
    {
        name: "20:9",
        items: [
            { name: "FHD+", width: 2400, height: 1080 },
            { name: "QHD+", width: 3200, height: 1440 },
            { name: "4K+", width: 4800, height: 2160 },
        ],
    },
    {
        name: "32:9",
        items: [
            { name: "Dual FHD", width: 3840, height: 1080 },
            { name: "Dual QHD", width: 5120, height: 1440 },
            { name: "Dual 4K", width: 7680, height: 2160 },
        ],
    },
    {
        name: "DCI",
        items: [
            { name: "DCI 2K", width: 2048, height: 1080 },
            { name: "DCI 4K", width: 4096, height: 2160 },
        ],
    },
    {
        name: "Square",
        items: [
            { name: "1080p", width: 1080, height: 1080 },
            { name: "1920p", width: 1920, height: 1920 },
            { name: "2160p", width: 2160, height: 2160 },
            { name: "3840p", width: 3840, height: 3840 },
        ],
    },
    {
        name: "2.39:1 Anamorphic Cinema",
        items: [
            { name: "DCI 2K Scope", width: 2048, height: 858 },
            { name: "DCI 4K Scope", width: 4096, height: 1716 },
        ],
    },
];
const ResolutionInput = memo(function ResolutionInput(
    props: Size & {
        type: "content" | "screen";
        onChange: (ev: React.ChangeEvent<HTMLInputElement>) => void;
    },
) {
    const { width, height, type, onChange } = props;

    return (
        <ItemActions>
            <RatioText width={width} height={height} />
            <Input
                name={`${type}-width`}
                type="number"
                placeholder="1920"
                value={isNaN(width) ? "" : width}
                onChange={onChange}
                className="w-18"
            />
            <span className="text-xl">&times;</span>
            <Input
                name={`${type}-height`}
                type="number"
                placeholder="1080"
                value={isNaN(height) ? "" : height}
                onChange={onChange}
                className="w-18"
            />
            <ResolutionDropdown type={type} />
        </ItemActions>
    );
});

const ResolutionDropdown = memo(function ResolutionDropdown({
    type,
}: {
    type: "content" | "screen";
}) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <div>
                    <Button
                        variant={"outline"}
                        size={"icon"}
                        className="!px-2 py-0"
                        aria-label="More Options"
                    >
                        <HugeiconsIcon
                            icon={ArrowDown01Icon}
                            strokeWidth={2.5}
                        />
                    </Button>
                </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuLabel>Resolutions</DropdownMenuLabel>
                {resolutions.map((r) => (
                    <Fragment key={r.name}>
                        <ResolutionOptions
                            type={type}
                            groupLabel={r.name}
                            items={r.items}
                        />
                    </Fragment>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
});

const ResolutionOptions = memo(function ResolutionOptions(props: {
    type: "content" | "screen";
    groupLabel: string;
    items: ResolutionItem[];
}) {
    return (
        <DropdownMenuGroup>
            <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                    {props.groupLabel}
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                    <DropdownMenuSubContent>
                        {props.items.map((i) => (
                            <ResolutionOptionsItem
                                key={i.name}
                                {...i}
                                type={props.type}
                            />
                        ))}
                    </DropdownMenuSubContent>
                </DropdownMenuPortal>
            </DropdownMenuSub>
        </DropdownMenuGroup>
    );
});

const ResolutionOptionsItem = memo(function ResolutionOptionsItem(
    props: ResolutionItem & {
        type: "content" | "screen";
    },
) {
    const selected = useCallback(() => {
        const k1 =
            props.type === "screen" ? "screenResolution" : "contentResolution";

        useSettingsStore.getState().set(({ temp }) => {
            temp.remap[k1].width = props.width;
            temp.remap[k1].height = props.height;
        });
    }, [props.height, props.type, props.width]);

    return (
        <DropdownMenuItem onSelect={selected}>
            {props.name}
            <span className="inline-flex items-center justify-center leading-5">
                {"("}
                {props.width}
                <span className="text-xl leading-5">&times;</span>
                {props.height}
                {")"}
            </span>
        </DropdownMenuItem>
    );
});

const RatioText = memo(function RatioText(props: Size) {
    const ratio = useMemo(
        () => getAspectRatio(props.width, props.height),
        [props],
    );

    return (
        <span className="text-muted-foreground">
            {ratio.width}:{ratio.height}
        </span>
    );
});

const ScaleAction = memo(function ScaleAction() {
    const [strategy, set] = useSettingsStore(
        useShallow((s) => [s.temp.remap.scaleStrategy, s.set]),
    );

    const onChange = useCallback(
        (v: string) =>
            set((s) => {
                s.temp.remap.scaleStrategy = v as typeof strategy;
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
