import { cp } from "node:fs/promises";
import { readdirSync, statSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { zipSync } from "fflate";
import version from "./frontend/data/version.json";

// 1. Helper to recursively read files into fflate's expected Uint8Array format
function getFilesForFflate(dir: string, baseDir = "") {
    const filesObj: Record<string, Uint8Array> = {};
    const files = readdirSync(dir);

    for (const file of files) {
        const fullPath = join(dir, file);
        // fflate requires standard forward slashes for zip internal paths
        const zipPath = join(baseDir, file).replaceAll("\\", "/");

        if (statSync(fullPath).isDirectory()) {
            // Recursively add nested directories
            Object.assign(filesObj, getFilesForFflate(fullPath, zipPath));
        } else {
            // readFileSync returns a Buffer, which is a subclass of Uint8Array
            filesObj[zipPath] = readFileSync(fullPath);
        }
    }
    return filesObj;
}

const result = await Bun.build({
    entrypoints: ["./server/index.ts"],
    compile: {
        target: "bun-windows-x64",
        outfile: "./dist/server/projection",
        execArgv: ["--smol"],
        autoloadDotenv: false,
        autoloadBunfig: false,
        windows: {
            icon: "./public/favicon.ico",
            hideConsole: false,
            title: "Xellanix Projection",
            publisher: "Xellanix",
            version: version.version,
            description: "Xellanix Projection",
            copyright: "Copyright (c) 2025-2026, Xellanix",
        },
    },
    minify: true,
    sourcemap: "linked",
    bytecode: true,
    define: {
        "process.env.NODE_ENV": JSON.stringify("production"),
        VERSION: JSON.stringify(version.version),
    },
});

if (result.success) {
    console.log("✅ Build successful: ", result.outputs[0].path);

    const sourceDir = "./dist/frontend";
    const destDir = "./dist/server/frontend";
    const serverDir = "./dist/server";

    const zipDest = `./dist/projection-v${version.version}.zip`;

    try {
        await cp(sourceDir, destDir, { recursive: true, force: true });
        console.log("✅ Successfully copied frontend folder.");

        console.log("📦 Zipping the release package with fflate...");
        const archiveFiles = getFilesForFflate(serverDir);

        // zipSync creates the zip archive in memory (level 9 is max compression)
        const zippedData = zipSync(archiveFiles, { level: 9 });
        writeFileSync(zipDest, zippedData);
        console.log(`✅ Successfully created release archive at: ${join(process.cwd(), zipDest)}`);
    } catch (err) {
        console.error("❌ Failed to copy frontend folder: ", err);
    }
} else {
    console.error("❌ Build failed: ", result.logs);
}

export {};
