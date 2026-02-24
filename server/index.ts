import { serve, file } from "bun";
import { join } from "path";
import { engine, SERVER_PORT } from "$/socket";

const isProd = process.env.NODE_ENV === "production";
const FRONTEND_DIST = join(import.meta.dir, "../dist/frontend");
const { fetch, ...socketEngineHandler } = engine.handler();

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
        }

        return new Response(requestedFile);
    },

    ...socketEngineHandler,
});

console.log(`Server running on http://localhost:${SERVER_PORT} in ${isProd ? "PROD" : "DEV"} mode`);
