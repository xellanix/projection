import { BrandHorizontal } from "@/components/Brand";
import { ProjectionQueue } from "@/components/ProjectionQueue";
import { SettingsButton } from "@/components/SettingsButton";
import { EcoModeButton } from "@/components/stores/EcoMode";
import { memo } from "react";

export const Sidebar = memo(function Sidebar() {
    return (
        <div className="flex h-full flex-col gap-2 py-4 max-lg:pt-2">
            <ProjectionQueue />

            <div className="flex flex-col px-2 lg:px-4">
                <EcoModeButton />
                <SettingsButton />
            </div>

            <div className="mx-3 mt-2 flex flex-col items-center px-2 lg:px-4">
                <BrandHorizontal className="aspect-[131/28] h-auto w-full max-w-33" />
            </div>
        </div>
    );
});
