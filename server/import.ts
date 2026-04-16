import { file } from "bun";
import { existsSync, mkdirSync, rmSync } from "fs";
import { basename, dirname, extname, join } from "path";
import { JSDOM } from "jsdom";
import DOMPurify from "dompurify";

const TEMP_ASSETS_DIR = join(
    process.env.NODE_ENV === "production" ? dirname(process.execPath) : process.cwd(),
    "public/__temp/assets",
);

// Allowed file extensions for projections
const ALLOWED_EXTENSIONS = [".mp4", ".webm", ".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"];
export const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100 MB limit

// Initialize DOMPurify with a virtual window
const purify = DOMPurify(new JSDOM("").window);

/**
 * Sanitizes SVG and returns whether it was already clean.
 * @param svgString The raw SVG text
 * @returns {{isSafe: boolean, sanitized: string}} A tuple of whether the SVG was already clean, and the sanitized SVG
 */
function validateSVG(svgString: string): { isSafe: boolean; sanitized: string } {
    const sanitized = purify.sanitize(svgString, {
        PARSER_MEDIA_TYPE: "image/svg+xml",
        USE_PROFILES: { svg: true }, // Only allow SVG tags
        ADD_ATTR: ["viewBox"], // Ensure common SVG attributes stay
        // Force DOMPurify to return a string
        RETURN_DOM: false,
        RETURN_DOM_FRAGMENT: false,
    });

    // Strict check: if the sanitizer removed or changed ANYTHING,
    // we consider the original "unsafe" for this specific request logic.
    // Note: DOMPurify might trim whitespace or reorder attributes.
    const isSafe = svgString.trim() === sanitized.trim();

    return { isSafe, sanitized };
}

export async function importRequest(req: Request, path: string) {
    if (req.method === "POST" || req.method === "PUT") {
        // Path Traversal Protection: Extract ONLY the file name, discarding any folder paths
        const rawPath = decodeURIComponent(path);
        const filename = basename(rawPath);
        if (!filename) return new Response("Bad Request: Invalid filename", { status: 400 });

        // Extension Validation: Prevent executable/script uploads
        const ext = extname(filename).toLowerCase();
        if (!ALLOWED_EXTENSIONS.includes(ext)) {
            return new Response(`Unsupported Image Format: File type (${ext}) not allowed`, {
                status: 415,
            });
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

            if (ext === ".svg") {
                const rawContent = new TextDecoder().decode(bytes);
                if (!rawContent.includes("<svg")) {
                    return new Response("Invalid SVG: Missing <svg> tag", { status: 400 });
                }

                const { isSafe, sanitized } = validateSVG(rawContent);
                if (!isSafe) {
                    // This is a security feature to prevent malicious SVGs
                    // If it's not safe, just save the sanitized version
                    // and warn the user that it was sanitized and might not work as expected
                    await Bun.write(filePath, sanitized);

                    console.warn("Malicious or non-standard SVG detected. Sanitized and saved.");
                    console.warn(JSON.stringify(purify.removed));
                    return new Response("OK", { status: 200, headers: { "X-Sanitized": "true" } });
                }
            }

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
