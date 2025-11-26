export type ProjectionTransition = "none" | "fade";

type BackgroundUnion = "transparent" | (string & {});

type ProjectionItemBase = {
    name?: string;
    group?: string;
    bg?: BackgroundUnion;
    transition?: ProjectionTransition;
};
type ProjectionItemPrimitive = ProjectionItemBase & {
    type: "Image" | "Video";
    content: string;
};
type ProjectionItemText = ProjectionItemBase & {
    type: "Text";
    content: string;
    options?: {
        className?: string;
        style?: React.CSSProperties;
    };
};
type ProjectionItemComponent = ProjectionItemBase & {
    type: "Component";
    content: React.ReactNode;
};
export type ProjectionItem =
    | ProjectionItemPrimitive
    | ProjectionItemText
    | ProjectionItemComponent;

export type ProjectionMaster = {
    title: string;
    bg: BackgroundUnion;
    contents: ProjectionItem[];
    transition?: ProjectionTransition;
};

export type ProjectionMasterWithId = ProjectionMaster & {
    id: string;
};

export type ProjectionBackgroundsMap = Record<number, Record<number, number>>;

export type Size = {
    width: number;
    height: number;
};

export type InputChangeEvent = React.ChangeEvent<HTMLInputElement>;
