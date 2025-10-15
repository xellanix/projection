export type ProjectionItem = {
    type: "Text" | "Image" | "Video";
    content: string;
    bg?: string;
};

export type ProjectionMaster = {
    title: string;
    bg: string;
    contents: ProjectionItem[];
};

export type ProjectionBackgroundsMap = Record<number, Record<number, number>>;
