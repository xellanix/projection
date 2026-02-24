import { ProjectionMasterSchema } from "@/schemas/projection";

export const jsonToProjection = (json: string) => {
    const p: unknown = JSON.parse(json);
    const result = ProjectionMasterSchema.safeParse(p);

    if (!result.success) {
        console.error("Invalid JSON or Schema mismatch. Error: ", result.error);
        return null;
    }

    return result.data;
};
