import { BrandIcon } from "@/components/Brand";
import { ContentResizer } from "@/components/ContentResizer";
import { ProjectionQueue } from "@/components/ProjectionQueue";
import { EcoModeButton } from "@/components/stores/EcoMode";
import { memo } from "react";

export const Sidebar = memo(function Sidebar() {
    return (
        <div className="flex h-full flex-col gap-2 py-4">
            <ProjectionQueue />

            <div className="flex flex-col gap-2 px-4">
                <EcoModeButton />
            </div>

            <div className="h-12 px-7 py-2">
                <ContentResizer className="h-full w-full">
                    <BrandIcon />
                </ContentResizer>
            </div>
        </div>
    );
});
