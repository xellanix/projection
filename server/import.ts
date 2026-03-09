import { file } from "bun";
import { existsSync, mkdirSync, rmSync } from "fs";
import { basename, dirname, extname, join } from "path";

const TEMP_ASSETS_DIR = join(
    process.env.NODE_ENV === "production" ? dirname(process.execPath) : process.cwd(),
    "public/__temp/assets",
);

// Allowed file extensions for projections
const ALLOWED_EXTENSIONS = [".mp4", ".webm", ".jpg", ".jpeg", ".png", ".gif", ".webp"];
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100 MB limit

export async function importRequest(req: Request, path: string) {
    if (req.method === "POST" || req.method === "PUT") {
        // Path Traversal Protection: Extract ONLY the file name, discarding any folder paths
        const rawPath = decodeURIComponent(path);
        const filename = basename(rawPath);
        if (!filename) return new Response("Bad Request: Invalid filename", { status: 400 });

        // Extension Validation: Prevent executable/script uploads
        const ext = extname(filename).toLowerCase();
        if (!ALLOWED_EXTENSIONS.includes(ext)) {
            return new Response("Forbidden: File type not allowed", { status: 403 });
        }

        // Memory/DoS Protection: Reject massive payloads early
        const contentLength = parseInt(req.headers.get("content-length") || "0", 10);
        if (contentLength > MAX_FILE_SIZE) {
            return new Response("Payload Too Large", { status: 413 });
        }

        try {
            const bytes = await req.arrayBuffer();
            // Secondary check: verify actual payload size against the limit
            if (bytes.byteLength > MAX_FILE_SIZE) {
                return new Response("Payload Too Large", { status: 413 });
            }
            const filePath = join(TEMP_ASSETS_DIR, filename);
            const dirPath = dirname(filePath);

            if (!existsSync(dirPath)) mkdirSync(dirPath, { recursive: true });
            await Bun.write(filePath, bytes);

            return new Response("OK");
        } catch (error) {
            console.error("Failed to write asset:", error);
            return new Response("Internal Server Error", { status: 500 });
        }
    } else if (req.method === "GET") {
        // Apply basename check on GET requests too so users can't read internal server files!
        const rawPath = decodeURIComponent(path);
        const filename = basename(rawPath);

        if (!filename) return new Response("Bad Request", { status: 400 });

        const filePath = join(TEMP_ASSETS_DIR, filename);
        const reqFile = file(filePath);

        if (await reqFile.exists()) return new Response(reqFile);
        return new Response("Not Found", { status: 404 });
    }
}

export function cleanupAssets() {
    if (!existsSync(TEMP_ASSETS_DIR)) return;
    try {
        rmSync(TEMP_ASSETS_DIR, { recursive: true, force: true });
        console.log("Cleanup: Removed temporary assets.");
    } catch (error) {
        console.error("Cleanup failed:", error);
    }
}
