import { defineConfig, type PluginOption } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { existsSync } from "fs";

function fallbackSlidesResolver(): PluginOption {
    const targetPath = "@/data/__temp/slides";
    const virtualModuleId = "virtual:slides-fallback";
    const resolvedVirtualModuleId = "\0" + virtualModuleId;

    return {
        name: "vite-plugin-fallback-slides",
        resolveId(id) {
            if (id === targetPath || id.includes("data/__temp/slides")) {
                const actualPath = path.resolve(__dirname, "./frontend/data/__temp/slides/index");

                // If the file DOES NOT exist, redirect to our virtual module
                if (
                    !existsSync(actualPath) &&
                    !existsSync(actualPath + ".js") &&
                    !existsSync(actualPath + ".ts")
                ) {
                    return resolvedVirtualModuleId;
                }
            }
            return null; // Let Vite handle it normally if the file exists
        },
        load(id) {
            if (id === resolvedVirtualModuleId) {
                // This is the code that will be injected if the file is missing
                return `export const _projections = [];`;
            }
        },
    };
}

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        react({
            babel: {
                plugins: [["babel-plugin-react-compiler"]],
            },
        }),
        fallbackSlidesResolver(),
    ],
    server: {
        allowedHosts: [".trycloudflare.com"],
        port: 12527,
        proxy: {
            "/api/socket_io/": {
                target: "ws://localhost:12526",
                changeOrigin: true,
                ws: true,
            },
            "/api/assets/": {
                target: "http://localhost:12526",
                changeOrigin: true,
            },
        },
    },
    base: "./",
    build: {
        minify: true,
        assetsInlineLimit: 0,
        outDir: "dist/frontend",
    },
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./frontend"),
            $: path.resolve(__dirname, "./server"),
            "#": path.resolve(__dirname, "./"),
        },
    },
});
