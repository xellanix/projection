import { unzipSync, strFromU8 } from "fflate";
import { jsonToProjection } from "@/lib/json-to-projection";
import { useProjectionStore } from "@/stores/projection.store";
import type { Socket } from "socket.io-client";
import { toast } from "sonner";

export async function processImportedFiles(files: File[], socket: Socket, onSuccess?: () => void) {
    for (const f of files) {
        if (f.name.endsWith(".json")) {
            if (f.name.endsWith("settings.json")) continue;

            const text = await f.text();
            const p: unknown = JSON.parse(text);
            const ps: unknown[] = Array.isArray(p) ? p : [p];

            for (const _p of ps) {
                const res = jsonToProjection(_p, true);
                if (res === null) continue;
                useProjectionStore.getState().addProjection(res);
                socket.emit("client:queue:add", _p);
            }
        } else if (f.name.endsWith(".zip")) {
            const arrayBuffer = await f.arrayBuffer();
            const unzipped = unzipSync(new Uint8Array(arrayBuffer));

            // Upload Assets via raw buffer body
            for (const [path, uint8Array] of Object.entries(unzipped)) {
                if (path.startsWith("assets/") && uint8Array.length > 0) {
                    const safeName = path.replace("assets/", "");
                    let mime = "application/octet-stream";

                    if (safeName.endsWith(".mp4")) mime = "video/mp4";
                    else if (safeName.endsWith(".webm")) mime = "video/webm";
                    else if (/\.(jpg|jpeg|png|gif|webp)$/i.exec(safeName))
                        mime = `image/${safeName.split(".").pop()}`;

                    const fileBlob = new Blob([uint8Array as unknown as BlobPart], { type: mime });

                    try {
                        const response = await fetch(
                            `/api/assets/${encodeURIComponent(safeName)}`,
                            {
                                method: "POST",
                                body: fileBlob,
                            },
                        );

                        if (!response.ok) {
                            const errorMsg = `Failed to upload ${safeName}: ${response.statusText}`;
                            toast.error(errorMsg);
                            console.error(errorMsg);
                        }
                    } catch (error) {
                        let err: string;
                        if (error instanceof Error) err = error.message;
                        else if (typeof error === "string") err = error;
                        else err = JSON.stringify(error);

                        const errorMsg = `Network error while uploading ${safeName}: ${err}`;
                        toast.error(errorMsg);
                        console.error(errorMsg);
                    }
                }
            }

            // Read JSON entries, convert, and push to store/socket
            for (const [path, uint8Array] of Object.entries(unzipped)) {
                if (path.endsWith(".json") && !path.startsWith("assets/")) {
                    if (path.endsWith("settings.json")) continue;

                    const text = strFromU8(uint8Array);
                    const data = JSON.parse(text);
                    const projectionsData = Array.isArray(data) ? data : [data];

                    for (const p of projectionsData) {
                        const ps: unknown[] = Array.isArray(p) ? p : [p];

                        for (const _p of ps) {
                            const res = jsonToProjection(_p, true);
                            if (res === null) continue;
                            useProjectionStore.getState().addProjection(res);
                            socket.emit("client:queue:add", _p);
                        }
                    }
                }
            }
        }
    }

    onSuccess?.();
}
