import { serve, file } from "bun";
import { join } from "path";
import { engine, SERVER_PORT } from "$/socket";

const isProd = process.env.NODE_ENV === "production";
const FRONTEND_DIST = join(process.execPath, "../frontend");
const { fetch, ...socketEngineHandler } = engine.handler();

declare const VERSION: string;

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

        if (url.pathname.startsWith(engine.opts.path)) {
            return engine.handleRequest(req, server);
        }

        if (!isProd) {
            return new Response(
                "Bun Backend: Running in DEV mode. Please use the Vite dev server to view the frontend.",
                { headers: { "Content-Type": "text/plain" } },
            );
        }

        let path = url.pathname;
        if (path === "/") path = "/index.html";

        let requestedFile = file(join(FRONTEND_DIST, path));

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
