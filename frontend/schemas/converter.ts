import {
    union,
    string,
    object,
    literal,
    array,
    type infer as zInfer,
    type ZodString,
    number,
    bigint,
    type ZodType,
} from "zod";

export type InferObject<T> = zInfer<T>;

export const BaseComponentSchema = <T extends string, P extends ZodType>(elemType: T, props: P) =>
    object({
        type: literal(elemType),
        key: union([string(), number(), bigint()]).nullish(),
        props,
    });
export type BaseComponentObject<T extends string, P extends ZodType> = ReturnType<
    typeof BaseComponentSchema<T, P>
>;
export type BaseComponent<T extends string, P extends ZodType> = InferObject<
    BaseComponentObject<T, P>
>;

export const SpanComponentSchema = BaseComponentSchema(
    "span",
    object({
        get children() {
            const schemas = AllowedComponentSchemas();
            return union([schemas, array(schemas)]).optional();
        },
        className: string().optional(),
    }).optional(),
);

export const BrComponentSchema = BaseComponentSchema(
    "br",
    object({
        className: string().optional(),
    }).optional(),
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const _allowedComponentSchemas: (ZodString | BaseComponentObject<any, any>)[] = [
    string(),
    SpanComponentSchema,
    BrComponentSchema,
];
export const AllowedComponentSchemas = () => union(_allowedComponentSchemas);
export const addSchema = <T extends string, P extends ZodType>(
    schema: BaseComponentObject<T, P>,
) => {
    _allowedComponentSchemas.push(schema);
};
