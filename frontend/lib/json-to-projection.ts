import { ProjectionMasterSchema } from "@/schemas/projection";

const replaceUrl = (url: string) => {
    if (url.startsWith("asset://")) {
        return `/api/assets/${encodeURIComponent(url.replace("asset://", ""))}`;
    }
    return url;
};

export const jsonToProjection = (json: string, rewriteAssets: boolean = false) => {
    const p: unknown = JSON.parse(json);
    const result = ProjectionMasterSchema.safeParse(p);

    if (!result.success) {
        console.error("Invalid JSON or Schema mismatch. Error: ", result.error);
        return null;
    }

    const data = result.data;

    if (rewriteAssets) {
        if (data.bg) data.bg = replaceUrl(data.bg);

        data.contents.forEach((c) => {
            if (c.bg) c.bg = replaceUrl(c.bg);

            // Only rewrite content string if it's an Image or Video.
            // Text content shouldn't be touched, and Component content is a ReactNode.
            if ((c.type === "Image" || c.type === "Video") && typeof c.content === "string") {
                c.content = replaceUrl(c.content);
            }
        });
    }

    return data;
};
