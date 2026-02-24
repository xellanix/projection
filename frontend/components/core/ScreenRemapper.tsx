import { ContentResizer } from "@/components/core/ContentResizer";
import { useSettingsStore } from "@/stores/settings.store";
import type { Size } from "@/types";
import { memo, useLayoutEffect, useRef } from "react";

function RawRemapperContainerR({
    ref,
    children,
}: {
    ref: React.Ref<HTMLDivElement>;
    children: React.ReactNode;
}) {
    return (
        <div
            ref={ref}
            className="relative flex h-[1080px] w-[1920px] items-center justify-center overflow-hidden"
            data-slot="screen-remapper"
        >
            {children}
        </div>
    );
}
const RawRemapperContainer = memo(RawRemapperContainerR);
RawRemapperContainer.displayName = "RawRemapperContainer";

function RemapperContainerR({ children }: { children: React.ReactNode }) {
    const rawRef = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        const setRawSize = (contentRes: Size) => {
            if (!rawRef.current) return;
            rawRef.current.style.width = `${contentRes.width}px`;
            rawRef.current.style.height = `${contentRes.height}px`;
        };

        const unsubscribe = useSettingsStore.subscribe((s, prev) => {
            const contentRes = s.global.remap.contentResolution;
            if (contentRes === prev.global.remap.contentResolution) return;

            setRawSize(contentRes);
        });

        setRawSize(useSettingsStore.getState().global.remap.contentResolution);

        return unsubscribe;
    }, []);

    return <RawRemapperContainer ref={rawRef}>{children}</RawRemapperContainer>;
}
export const RemapperContainer = memo(RemapperContainerR);
RemapperContainer.displayName = "RemapperContainer";

const calcStretchFactor = (
    contentRes: Size,
    screenRes: Size,
    contentFit: "fit" | "fill",
) => {
    const { width: cw, height: ch } = contentRes;
    const { width: sw, height: sh } = screenRes;

    // prettier-ignore
    // !number covers 0 and NaN efficiently
    if (
        !cw || !ch || !sw || !sh ||
        !Number.isFinite(cw) || !Number.isFinite(ch) ||
        !Number.isFinite(sw) || !Number.isFinite(sh)
    ) {
        return { width: 0, height: 0 };
    }

    const n1 = sw * ch;
    const n2 = sh * cw;
    const isLandscape = cw > ch;
    const isFit = contentFit === "fit";

    // If orientations match the fit mode logic (Landscape & Fit) OR (Portrait & Fill)
    // we scale the Width. Otherwise, we scale the Height.
    if (isLandscape === isFit) {
        return { width: n2 / n1, height: 1 };
    }

    return { width: 1, height: n1 / n2 };
};

interface ScreenRemapperProps {
    children: React.ReactNode;
}
function ScreenRemapperR({ children }: ScreenRemapperProps) {
    const scalerRef = useRef<HTMLDivElement>(null);
    const rawRef = useRef<HTMLDivElement>(null);
    useLayoutEffect(() => {
        const setRawSize = (contentRes: Size) => {
            if (!rawRef.current) return;
            rawRef.current.style.width = `${contentRes.width}px`;
            rawRef.current.style.height = `${contentRes.height}px`;
        };

        const setScalerSize = (
            contentRes: Size,
            screenRes: Size,
            contentFit: "fit" | "fill",
        ) => {
            if (!scalerRef.current) return;
            const res = calcStretchFactor(contentRes, screenRes, contentFit);
            scalerRef.current.style.transform = `scale(${res.width}, ${res.height})`;
        };

        const unsubscribe = useSettingsStore.subscribe((s, prev) => {
            const screenRes = s.global.remap.screenResolution;
            const contentRes = s.global.remap.contentResolution;
            const contentFit = s.global.remap.scaleStrategy;

            // SECTION A:
            // Only update the raw element if the content resolution has changed
            if (contentRes !== prev.global.remap.contentResolution) {
                setRawSize(contentRes);
            }

            // SECTION B:
            // Only update the scaler element if
            // the screen resolution or content resolution or the scaling strategy
            // has changed
            if (
                screenRes !== prev.global.remap.screenResolution ||
                contentRes !== prev.global.remap.contentResolution ||
                contentFit !== prev.global.remap.scaleStrategy
            ) {
                setScalerSize(contentRes, screenRes, contentFit);
            }
        });

        {
            const { screenResolution, contentResolution, scaleStrategy } =
                useSettingsStore.getState().global.remap;
            setRawSize(contentResolution);
            setScalerSize(contentResolution, screenResolution, scaleStrategy);
        }

        return unsubscribe;
    }, []);

    return (
        <div className="absolute h-full w-full">
            <ContentResizer className="h-full w-full">
                <RawRemapperContainer ref={rawRef}>
                    <div
                        ref={scalerRef}
                        className="flex h-full w-full origin-center transform-[scale(0)] flex-col transition-transform duration-300 ease-out"
                    >
                        {children}
                    </div>
                </RawRemapperContainer>
            </ContentResizer>
        </div>
    );
}
export const ScreenRemapper = memo(ScreenRemapperR);
ScreenRemapper.displayName = "ScreenRemapper";
