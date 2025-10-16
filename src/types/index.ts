import type { JSX } from "react";

export type ProjectionTransition = "none" | "fade";

type ProjectionItemBase = {
    name?: string;
    group?: string;
    bg?: string;
    transition?: ProjectionTransition;
};
type ProjectionItemPrimitive = ProjectionItemBase & {
    type: "Text" | "Image" | "Video";
    content: string;
};
type ProjectionItemComponent = ProjectionItemBase & {
    type: "Component";
    content: () => JSX.Element;
};

export type ProjectionItem = ProjectionItemPrimitive | ProjectionItemComponent;

export type ProjectionMaster = {
    title: string;
    bg: string;
    contents: ProjectionItem[];
    transition?: ProjectionTransition;
};

export type ProjectionBackgroundsMap = Record<number, Record<number, number>>;
