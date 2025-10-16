import type { JSX } from "react";

type ProjectionItemBase = {
    name?: string;
    bg?: string;
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
};

export type ProjectionBackgroundsMap = Record<number, Record<number, number>>;
