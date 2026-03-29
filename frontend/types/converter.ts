/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    type BrComponentSchema,
    type SpanComponentSchema,
    type BaseComponent,
} from "@/schemas/converter";
import type { infer as zInfer } from "zod";

type SpanComponent = zInfer<typeof SpanComponentSchema>;
type BrComponent = zInfer<typeof BrComponentSchema>;

type ConverterMap = {
    span: (content: SpanComponent) => ConverterReturn;
    br: (content: BrComponent) => ConverterReturn;
    $string: (content: string) => string;
    [key: string]:
        | ((content: string) => ConverterReturn)
        | ((content: BaseComponent<any, any>) => ConverterReturn);
};
type AllowedComponents = Parameters<ConverterMap[keyof ConverterMap]>[0];
type ConverterReturn = React.ReactNode;

export type {
    BaseComponent,
    SpanComponent,
    BrComponent,
    AllowedComponents,
    ConverterMap,
    ConverterReturn,
};
