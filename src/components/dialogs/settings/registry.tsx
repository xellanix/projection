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

export const navs: NavigationItem[] = [
    {
        id: "1",
        title: "Backdrop",
        icon: LayerIcon,
        content: <BackdropSetting />,
    },
    {
        id: "2",
        title: "Cover Screen",
        icon: Image02Icon,
        content: <CoverSetting />,
    },
    {
        id: "3",
        title: "Remote Control",
        icon: SmartphoneWifiIcon,
        content: <RemoteSetting />,
        isLocal: true,
    },
    {
        id: "4",
        title: "Screen Remapping",
        icon: MaximizeScreenIcon,
        content: <RemapSetting />,
    },
];

export const footers: NavigationItem[] = [
    {
        id: "f-about",
        title: "About",
        icon: InformationCircleIcon,
        content: <AboutSetting />,
    },
];
