"use client";

import { ContentResizer } from "@/components/core/ContentResizer";
import { useSettingsStore } from "@/stores/settings.store";
import type { Size } from "@/types";
import { memo, useCallback, useLayoutEffect, useState } from "react";
import { useShallow } from "zustand/react/shallow";

function RawRemapperContainerR({
    contentRes,
    children,
}: {
    contentRes: Size;
    children: React.ReactNode;
}) {
    return (
        <div
            className="relative flex items-center justify-center overflow-hidden"
            style={{
                width: `${contentRes.width}px`,
                height: `${contentRes.height}px`,
            }}
            data-slot="screen-remapper"
        >
            {children}
        </div>
    );
}
const RawRemapperContainer = memo(RawRemapperContainerR);
RawRemapperContainer.displayName = "RawRemapperContainer";

function RemapperContainerR({ children }: { children: React.ReactNode }) {
    const contentRes = useSettingsStore(
        (s) => s.global.remap.contentResolution,
    );

    return (
        <RawRemapperContainer contentRes={contentRes}>
            {children}
        </RawRemapperContainer>
    );
}
export const RemapperContainer = memo(RemapperContainerR);
RemapperContainer.displayName = "RemapperContainer";

interface ScreenRemapperProps {
    children: React.ReactNode;
}
function ScreenRemapperR({ children }: ScreenRemapperProps) {
    const [scale, setScale] = useState<Size>({ width: 0, height: 0 });
    const [screenRes, contentRes, contentFit] = useSettingsStore(
        useShallow((s) => [
            s.global.remap.screenResolution,
            s.global.remap.contentResolution,
            s.global.remap.scaleStrategy,
        ]),
    );

    const handleResize = useCallback(() => {
        const contentW = contentRes.width;
        const contentH = contentRes.height;

        // Handle empty content
        if (contentW === 0 || contentH === 0) {
            setScale({ width: 0, height: 0 });
            return;
        }

        const n1 = screenRes.width * contentH;
        const n2 = screenRes.height * contentW;
        const s: Size = { width: 1, height: 1 };
        if (contentW > contentH) {
            // Handle landscape content
            if (contentFit === "fit") s.width = n2 / n1;
            else s.height = n1 / n2;
        } else {
            // Handle portrait or square content
            if (contentFit === "fit") s.height = n1 / n2;
            else s.width = n2 / n1;
        }
        setScale(s);
    }, [contentFit, contentRes, screenRes]);

    useLayoutEffect(() => {
        // Initial calculation
        handleResize();
    }, [handleResize]);

    return (
        <div className="absolute h-full w-full">
            <ContentResizer className="h-full w-full">
                <RawRemapperContainer contentRes={contentRes}>
                    <div
                        className="flex h-full w-full flex-col"
                        style={{
                            transform: `scale(${scale.width}, ${scale.height})`,
                        }}
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
