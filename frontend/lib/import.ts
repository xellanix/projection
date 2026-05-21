import { unzipSync, strFromU8 } from "fflate";
import { jsonToProjection } from "@/lib/json-to-projection";
import { useProjectionStore } from "@/stores/projection.store";
import type { Socket } from "socket.io-client";
import { toast } from "sonner";
import { useImportSettingsStore } from "@/stores/import.settings.store";

export function replaceUrl(url: string) {
    if (url.startsWith("asset://")) {
        return `/api/assets/${encodeURIComponent(url.replace("asset://", ""))}`;
    }
    return url;
}

function importSettings(data: unknown) {
    useImportSettingsStore.getState().tryToImport(data);
}

function tryAddProjectionFromJson(text: string, path: string, socket: Socket) {
    const data = JSON.parse(text);

    if (path.endsWith("settings.json")) {
        importSettings(data);
        return false;
    }

    // Contains multiple projection masters
    const projectionsData = Array.isArray(data) ? data : [data];
    for (const p of projectionsData) {
        // Process each projection master
        const ps: unknown[] = Array.isArray(p) ? p : [p];
        for (const _p of ps) {
            const res = jsonToProjection(_p, true);
            if (res === null) continue;
            useProjectionStore.getState().addProjection(res);
            socket.emit("client:queue:add", _p);
        }
    }

    return true;
}

const MIME_MAP: Record<string, string> = {
    mp4: "video/mp4",
    webm: "video/webm",
    svg: "image/svg+xml",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
};

function getMime(name: string): string {
    const ext = name.split(".").pop()?.toLowerCase() ?? "";
    return MIME_MAP[ext] ?? "application/octet-stream";
}

export async function processImportedFiles(files: File[], socket: Socket, onSuccess?: () => void) {
    let total = 0,
        processed = 0;
    for (const f of files) {
        if (f.name.endsWith(".json")) {
            const text = await f.text();
            if (!tryAddProjectionFromJson(text, f.name, socket)) continue;
        } else if (f.name.endsWith(".zip")) {
            const arrayBuffer = await f.arrayBuffer();
            const unzipped = unzipSync(new Uint8Array(arrayBuffer));

            const entries = Object.entries(unzipped);

            // Upload Assets via raw buffer body
            for (const [path, uint8Array] of entries) {
                if (path.startsWith("assets/") && uint8Array.length > 0) {
                    total++;
                    const safeName = path.replace("assets/", "");
                    const fileBlob = new Blob([uint8Array as unknown as BlobPart], {
                        type: getMime(safeName),
                    });

                    try {
                        const response = await fetch(
                            `/api/assets/${encodeURIComponent(safeName)}`,
                            {
                                method: "POST",
                                body: fileBlob,
                            },
                        );

                        if (!response.ok) {
                            showToastError(`Failed to upload ${safeName}: ${response.statusText}`);
                            continue;
                        } else if (response.headers.has("x-sanitized")) {
                            const msg = `Uploaded successfully with sanitized content. It might not work as expected. Filename: ${safeName}`;
                            toast.warning(msg);
                            console.warn(msg);
                        }

                        processed++;
                    } catch (error) {
                        const err =
                            error instanceof Error ? error.message
                            : typeof error === "string" ? error
                            : JSON.stringify(error);

                        showToastError(`Network error while uploading ${safeName}: ${err}`);
                    }
                }
            }

            // Read JSON entries, convert, and push to store/socket
            for (const [path, uint8Array] of entries) {
                if (path.endsWith(".json") && !path.startsWith("assets/")) {
                    const text = strFromU8(uint8Array);
                    if (!tryAddProjectionFromJson(text, path, socket)) continue;
                }
            }

            if (total < 1) {
                toast.info("No assets found in the projection file.");
            } else if (total > 0) {
                if (processed === total) {
                    toast.success(`Uploaded all assets successfully. Total: ${total} assets.`);
                } else if (processed > 0) {
                    toast.success(`Uploaded ${processed}/${total} assets successfully.`);
                } else {
                    toast.error(`Failed to upload any assets. Total: ${total} assets.`);
                }
            }
        }
    }

    onSuccess?.();
}

function showToastError(message: string) {
    toast.error(message);
    console.error(message);
}
