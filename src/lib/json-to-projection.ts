import { ProjectionMasterSchema } from "@/schemas/projection";
import type { ProjectionMaster } from "@/types";

export const jsonToProjection = (json: string) => {
    const p = JSON.parse(json);
    const result = ProjectionMasterSchema.safeParse(p);

    if (!result.success) {
        console.error("Invalid JSON or Schema mismatch. Error: ", result.error);
        return null;
    }

    return result.data as ProjectionMaster;
};
