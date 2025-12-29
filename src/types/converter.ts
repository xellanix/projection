import type { ProjectionMaster } from "@/types";
import type { JSX } from "react";

type ComponentProps<P> = P & { className?: string };
type BaseComponent<
    T extends string,
    P extends object = {},
    O extends boolean = true,
> = {
    type: T;
    key?: React.Key | null | undefined;
} & (O extends true
    ? { props?: ComponentProps<P> }
    : { props: ComponentProps<P> });

type SpanComponent = BaseComponent<"span", { children?: AllowedComponents[] }>;
type BrComponent = BaseComponent<"br">;

type ConverterMap = {
    span: (content: SpanComponent) => JSX.Element;
    br: (content: BrComponent) => JSX.Element;
    $string: (content: string) => string;
    [key: string]:
        | ((content: string) => ConverterReturn)
        | { (content: BaseComponent<any>): JSX.Element };
};
type AllowedComponents = Parameters<ConverterMap[keyof ConverterMap]>[0];
type ConverterReturn = React.ReactNode;

type ProjectionMasterJSON = Omit<ProjectionMaster, "contents"> & {
    contents: AllowedComponents[];
};

export type {
    BaseComponent,
    SpanComponent,
    BrComponent,
    AllowedComponents,
    ConverterMap,
    ConverterReturn,
    ProjectionMasterJSON,
};
