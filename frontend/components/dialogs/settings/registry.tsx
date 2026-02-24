import { type IconSvgElement } from "@hugeicons/react";
import {
    Image02Icon,
    InformationCircleIcon,
    LayerIcon,
    MaximizeScreenIcon,
    SmartphoneWifiIcon,
} from "@hugeicons-pro/core-stroke-rounded";

import { BackdropSetting } from "./BackdropSetting";
import { CoverSetting } from "./CoverSetting";
import { RemoteSetting } from "./RemoteSetting";
import { RemapSetting } from "./RemapSetting";
import { AboutSetting } from "./AboutSetting";

export type NavigationItem = {
    id: string;
    title: string;
    icon: IconSvgElement;
    content: React.ReactNode;
    isLocal?: boolean;
};

export const NAVIGATION_LOOKUP: Record<string, NavigationItem> = {
    "1": {
        id: "1",
        title: "Backdrop",
        icon: LayerIcon,
        content: <BackdropSetting />,
    },
    "2": {
        id: "2",
        title: "Cover Screen",
        icon: Image02Icon,
        content: <CoverSetting />,
    },
    "3": {
        id: "3",
        title: "Remote Control",
        icon: SmartphoneWifiIcon,
        content: <RemoteSetting />,
        isLocal: true,
    },
    "4": {
        id: "4",
        title: "Screen Remapping",
        icon: MaximizeScreenIcon,
        content: <RemapSetting />,
    },
};
export const NAVIGATION_LIST = Object.values(NAVIGATION_LOOKUP);

export const FOOTER_LOOKUP: Record<string, NavigationItem> = {
    "f-about": {
        id: "f-about",
        title: "About",
        icon: InformationCircleIcon,
        content: <AboutSetting />,
    },
};
export const FOOTER_LIST = Object.values(FOOTER_LOOKUP);
