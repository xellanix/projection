import { serve, file } from "bun";
import { dirname, join } from "path";
import { engine, SERVER_PORT } from "$/socket";
import { cleanupAssets, importRequest } from "$/import";

const isProd = process.env.NODE_ENV === "production";
const FRONTEND_DIST = join(dirname(process.execPath), "frontend");
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
    port: SERVER_PORT,

    async fetch(req, server) {
        const url = new URL(req.url);
        const path = url.pathname;

        if (path.startsWith(engine.opts.path)) {
            return engine.handleRequest(req, server);
        }

        if (path.startsWith("/api/assets/")) {
            return await importRequest(req, path.replace("/api/assets/", ""));
        }

        if (!isProd) {
            return new Response(
                "Bun Backend: Running in DEV mode. Please use the Vite dev server to view the frontend.",
                { headers: { "Content-Type": "text/plain" } },
            );
        }

        let reqPath = decodeURIComponent(path);
        if (reqPath === "/") reqPath = "/index.html";

        const targetPath = join(FRONTEND_DIST, reqPath);
        if (!targetPath.startsWith(FRONTEND_DIST)) {
            return new Response("Forbidden: Invalid Path", { status: 403 });
        }

        let requestedFile = file(targetPath);
        if (!(await requestedFile.exists())) {
            requestedFile = file(join(FRONTEND_DIST, "index.html"));

            // Safety check: if index.html is completely missing, return a clean 404
            if (!(await requestedFile.exists())) {
                return new Response(
                    "Frontend files not found. Ensure the 'frontend' folder is located in the same directory as this executable.",
                    { status: 404, headers: { "Content-Type": "text/plain" } },
                );
            }
        }

        return new Response(requestedFile);
    },

    ...socketEngineHandler,
});

console.log(`│ Server: http://localhost:${SERVER_PORT} │`);
console.log(`│ Mode  : ${isProd ? "production " : "development"}            │`);
console.log("└────────────────────────────────┘");

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
