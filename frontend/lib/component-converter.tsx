/* eslint-disable @typescript-eslint/no-explicit-any */
import { generateId } from "@/lib/utils";
import { addSchema, BaseComponentSchema, type BaseComponent } from "@/schemas/converter";
import type * as CT from "@/types/converter";
import type { ZodType } from "zod";

const spanConverter = ({ key, props: { children, ...props } = {} }: CT.SpanComponent) => {
    const processedChildren: React.ReactNode[] = [];

    if (children) {
        if (!Array.isArray(children)) {
            children = [children];
        }

        for (const child of children) {
            if (typeof child !== "string") {
                if (typeof child.key === "string") child.key = child.key.trim() || undefined;
                child.key ??= generateId();
            }
            const converted = converter(child);
            processedChildren.push(converted);
        }
    }

    return (
        <span key={key} {...props}>
            {processedChildren}
        </span>
    );
};

const brConverter = ({ key, props = {} }: CT.BrComponent) => {
    return <br key={key} {...props} />;
};

const converterMap: CT.ConverterMap = {
    $null: () => null,
    span: spanConverter,
    br: brConverter,
    $string: (content: string) => content,
};

export const converter = (content: CT.AllowedComponents) => {
    let key = typeof content === "string" ? "$string" : content.type;
    if (!converterMap[key]) key = "$null";

    return (converterMap[key] as (arg: CT.AllowedComponents) => CT.ConverterReturn)(content);
};

export const addConverter = <T extends string, S extends ZodType>(
    type: T,
    schema: S,
    converter: (content: BaseComponent<T, S>) => CT.ConverterReturn,
) => {
    addSchema(BaseComponentSchema(type, schema));
    converterMap[type] = converter as any;
};
