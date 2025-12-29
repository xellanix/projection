import type {
    ProjectionItemSchema,
    ProjectionMasterSchema,
    TransitionSchema,
} from "@/schemas/projection";
import type { infer as zInfer } from "zod";

export type BackgroundUnion = "transparent" | (string & {});

export type ProjectionTransition = zInfer<typeof TransitionSchema>;
export type ProjectionItem = zInfer<typeof ProjectionItemSchema>;
export type ProjectionMaster = zInfer<typeof ProjectionMasterSchema>;

export type ProjectionMasterWithId = ProjectionMaster & {
    id: string;
};

export type ProjectionBackgroundsMap = Record<number, Record<number, number>>;

export type Size = {
    width: number;
    height: number;
};

export type InputChangeEvent = React.ChangeEvent<HTMLInputElement>;
