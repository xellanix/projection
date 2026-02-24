import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        react({
            babel: {
                plugins: [["babel-plugin-react-compiler"]],
            },
        }),
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
