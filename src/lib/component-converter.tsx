/* eslint-disable @typescript-eslint/no-empty-object-type */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import type * as CT from "@/types/converter";

const spanConverter = ({
    key,
    props: { children, ...props } = {},
}: CT.SpanComponent) => {
    const processedChildren: React.ReactNode[] = [];

    if (children) {
        let i = 0;
        for (const child of children) {
            if (typeof child !== "string") {
                child.key = i++;
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
    span: spanConverter,
    br: brConverter,
    $string: (content: string) => content,
};

export const converter = (content: CT.AllowedComponents) => {
    const key = typeof content === "string" ? "$string" : content.type;

    return (
        converterMap[key] as (arg: CT.AllowedComponents) => CT.ConverterReturn
    )(content);
};

export const addConverter = <
    T extends string,
    P extends object = {},
    O extends boolean = true,
>(
    type: T,
    converter: (content: CT.BaseComponent<T, P, O>) => CT.ConverterReturn,
) => {
    converterMap[type] = converter as any;
};
