import { converter } from "@/lib/component-converter";
import type { BackgroundUnion } from "@/types";
import {
    union,
    string,
    object,
    record,
    number,
    bigint,
    unknown,
    type ZodType,
    literal,
    type infer as zInfer,
    array,
} from "zod";

export const TransitionSchema = union([literal("fade"), literal("none")]);

const ProjectionItemBaseSchema = object({
    name: string().optional(),
    group: string().optional(),
    bg: (string() as ZodType<BackgroundUnion>).optional(),
    transition: TransitionSchema.optional(),
});

const ProjectionItemPrimitiveSchema = ProjectionItemBaseSchema.extend({
    type: union([literal("Image"), literal("Video")]),
    content: string(),
});

const ProjectionItemTextSchema = ProjectionItemBaseSchema.extend({
    type: literal("Text"),
    content: string(),
    options: object({
        className: string().optional(),
        style: (
            record(
                string(),
                union([string(), number()]),
            ) as ZodType<React.CSSProperties>
        ).optional(),
    }).optional(),
});

const JsonComponentSchema = object({
    type: string(),
    key: union([string(), number(), bigint()]).nullish(),
    props: record(string(), unknown()).optional(),
});

const ProjectionItemComponentSchema = ProjectionItemBaseSchema.extend({
    type: literal("Component"),
    content: union([JsonComponentSchema, string()]).transform(
        converter,
    ) as ZodType<React.ReactNode, zInfer<typeof JsonComponentSchema> | string>,
});

export const ProjectionItemSchema = union([
    ProjectionItemPrimitiveSchema,
    ProjectionItemTextSchema,
    ProjectionItemComponentSchema,
]);

export const ProjectionMasterSchema = object({
    title: string(),
    bg: string() as ZodType<BackgroundUnion>,
    contents: array(ProjectionItemSchema),
    transition: TransitionSchema.optional(),
});
