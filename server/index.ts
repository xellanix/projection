import { serve } from "bun";
import open from "open";
import { engine, SERVER_PORT, FRONTEND_PORT } from "$/socket";
import { cleanupAssets, importRequest, MAX_FILE_SIZE } from "$/import";
import index from "../dist/frontend/index.html";
import { execDir } from "$/persistence";

const isProd = process.env.NODE_ENV === "production";
const { fetch, ...socketEngineHandler } = engine.handler();

declare const VERSION: string;

cleanupAssets();

console.log("┌────────────────────────────────┐");
console.log("│ Xellanix Projection            │");
{
    const len = 22 - VERSION.length;
    console.log(`│ Version ${VERSION}${len > 0 ? " ".repeat(len) : ""} │`);
}
console.log("├────────────────────────────────┤");

serve({
    ...socketEngineHandler,

    // Set it at the end of the server configuration options
    // so that all custom settings are fully applied
    // and not overridden by the configuration
    // from the libraries being used.
    port: SERVER_PORT,
    maxRequestBodySize: MAX_FILE_SIZE,
    routes: {
        "/": prod(index),
        "/index.html": prod(index),
        "/view": prod(index),
    },
    async fetch(req, server) {
        const url = new URL(req.url);
        const path = decodeURIComponent(url.pathname)
            .replace(/^(\.\.(\/|\\|$))+/g, "")
            .replace(/\\/g, "/");

        const filePath = execDir(path);
        if (!filePath.startsWith(execDir())) {
            // Path Traversal Protection: Prevent path traversal attacks
            return new Response("Not Found: Invalid filename", { status: 404 });
        }

        if (path.startsWith(engine.opts.path)) {
            return engine.handleRequest(req, server);
        }

        if (path.startsWith("/api/assets/")) {
            return await importRequest(req, path.replace("/api/assets/", ""));
        }

        return new Response("Not Found: Invalid Path", { status: 404 });
    },
});

function prod<T>(val: T) {
    if (!isProd) {
        return new Response(
            "Bun Backend: Running in DEV mode. Please use the Vite dev server to view the frontend.",
        );
    }

    return val;
}

console.log(`│ Server: http://localhost:${SERVER_PORT} │`);
console.log(`│ Mode  : ${isProd ? "production " : "development"}            │`);
console.log("└────────────────────────────────┘");

if (process.env.ALREADY_OPENED !== "true") {
    void open(`http://localhost:${isProd ? SERVER_PORT : FRONTEND_PORT}`);
    process.env.ALREADY_OPENED = "true";
}

const SIGCleanup = () => {
    cleanupAssets();
    process.exit(0);
};

// Hook into process termination events
process.on("exit", cleanupAssets); // Normal exit
process.on("SIGINT", SIGCleanup); // Ctrl+C
process.on("SIGTERM", SIGCleanup); // Task manager kill
process.on("SIGHUP", SIGCleanup); // Terminal window closed
process.on("SIGQUIT", SIGCleanup); // Quit signal
