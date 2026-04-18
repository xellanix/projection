import { cp, rm } from "node:fs/promises";
import { readdirSync, statSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { zipSync } from "fflate";
import version from "./frontend/data/version.json";
import { readFile } from "node:fs/promises";
import packageJson from "./package.json";

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

async function copyFrontend(serverDir: string) {
    const sourceDir = "./dist/frontend" as const;
    const destDir = `${serverDir}/frontend`;

    try {
        console.log("─".repeat(Math.min(130, process.stdout.columns)));
        console.log("⌛ Copying frontend folder...");
        await rm(destDir, { recursive: true, force: true });
        await cp(sourceDir, destDir, { recursive: true, force: true });
        console.log("✅ Successfully copied frontend folder.");
    } catch (err) {
        console.error("❌ Failed to copy frontend folder:", err);
    }
}

function packOutputs(serverDir: string) {
    const zipDest = `./dist/projection-v${version.version}.zip`;

    try {
        console.log("─".repeat(Math.min(130, process.stdout.columns)));
        console.log("📦 Zipping the release package with fflate...");
        const archiveFiles = getFilesForFflate(serverDir);

        // zipSync creates the zip archive in memory (level 9 is max compression)
        const zippedData = zipSync(archiveFiles, { level: 9 });
        writeFileSync(zipDest, zippedData);
        console.log("✅ Successfully created release archive:", join(process.cwd(), zipDest));
    } catch (err) {
        console.error("❌ Failed to zip the release package:", err);
    }
}

const jsdomPatchPlugin: Bun.BunPlugin = {
    name: "jsdom-patch",
    setup: (build) => {
        build.onLoad(
            {
                filter: /node_modules[\\/]jsdom[\\/]lib[\\/]jsdom[\\/]living[\\/]xhr[\\/]XMLHttpRequest-impl\.js$/,
            },
            async (args) => {
                if (packageJson.dependencies.jsdom !== "29.0.2") {
                    throw new Error(
                        "JSDOM version mismatch. You might not need this patch anymore, so please remove it. If you still need it, please update the target version with your 'package.json'.",
                    );
                }
                console.log("Patching jsdom file:", args.path);
                let contents = await readFile(args.path, "utf8");
                // We don't need the sync worker, so removing it will make the bun's bundler work
                contents = contents.replace(
                    `require.resolve("./xhr-sync-worker.js")`,
                    JSON.stringify(""),
                );

                return {
                    contents,
                    loader: "js",
                };
            },
        );

        build.onLoad(
            {
                filter: /node_modules[\\/]jsdom[\\/]lib[\\/]jsdom[\\/]living[\\/]css[\\/]helpers[\\/]computed-style\.js$/,
            },
            async (args) => {
                if (packageJson.dependencies.jsdom !== "29.0.2") {
                    throw new Error(
                        "JSDOM version mismatch. You might not need this patch anymore, so please remove it. If you still need it, please update the target version with your 'package.json'.",
                    );
                }
                console.log("Patching jsdom file:", args.path);
                let contents = await readFile(args.path, "utf8");
                contents = contents.replace(
                    `const defaultStyleSheet = fs.readFileSync(
  path.resolve(__dirname, "../../../browser/default-stylesheet.css"),
  { encoding: "utf-8" }
)`,
                    `const defaultStyleSheet = ${JSON.stringify(
                        readFileSync(
                            join(
                                __dirname,
                                "node_modules/jsdom/lib/jsdom/browser/default-stylesheet.css",
                            ),
                            "utf-8",
                        ),
                    )}`,
                );

                return {
                    contents,
                    loader: "js",
                };
            },
        );
    },
};

const cssTreePatchPlugin: Bun.BunPlugin = {
    name: "css-tree-patch",
    setup: (build) => {
        build.onLoad(
            { filter: /node_modules[\\/]css-tree[\\/]lib[\\/](data-patch|data)\.js$/ },
            async (args) => {
                console.log("Patching css-tree file:", args.path);
                let contents = await readFile(args.path, "utf8");
                contents = contents.replace("const require = createRequire(import.meta.url);", "");

                return {
                    contents,
                    loader: "js",
                };
            },
        );
    },
};

const cssoTreeVersionPatchPlugin: Bun.BunPlugin = {
    name: "csso/css-tree-patch",
    setup: (build) => {
        const filter = /node_modules[\\/](csso|css-tree)[\\/]lib[\\/]version\.js$/;

        build.onLoad({ filter }, async (args) => {
            const packageName = args.path.match(filter)?.[1];
            console.log(`Patching ${packageName} file:`, args.path);

            const packageJsonPath = join(dirname(args.path), "../package.json");
            const packageJson = JSON.parse(await readFile(packageJsonPath, "utf8"));

            return {
                contents: `export const version = "${packageJson.version}";`,
                loader: "js",
            };
        });
    },
};

console.log("⌛ Patching and building server...");
console.log("");

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
    plugins: [jsdomPatchPlugin, cssTreePatchPlugin, cssoTreeVersionPatchPlugin],
});

if (result.success) {
    console.log("");
    console.log("✅ Successfully built server:", result.outputs[0].path);

    const serverDir = "./dist/server" as const;

    await copyFrontend(serverDir);
    packOutputs(serverDir);
} else {
    console.error("❌ Failed to build server:", result.logs);
}

export {};
