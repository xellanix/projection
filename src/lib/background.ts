export const isTransparent = (
    source: string | Blob | MediaSource | MediaStream | undefined,
) => {
    return !source || source === "transparent";
};
