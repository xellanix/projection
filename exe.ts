import { readdirSync, statSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import version from "./frontend/data/version.json";
import { readFile } from "node:fs/promises";
import packageJson from "./package.json";

// Helper to recursively read files into fflate's expected Uint8Array format
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

async function packOutputs(serverDir: string) {
    const releaseDest = `./dist/releases/v${version.version}`;

    const files = [{ src: "projection.exe", dest: "projection-windows-x64.exe" }];

    try {
        console.log("─".repeat(Math.min(130, process.stdout.columns)));
        console.log("⌛ Copying the release files...");

        for (let i = 0; i < files.length; i++) {
            const { src, dest } = files[i];
            const source = Bun.file(join(serverDir, src));
            await Bun.write(join(releaseDest, dest), source);
            console.log(`Copied ${i + 1}/${files.length}: ${dest}`);
        }

        console.log("✅ Successfully copied the release files:", join(process.cwd(), releaseDest));
    } catch (err) {
        console.error("❌ Failed to create the release files:", err);
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

import { parseArgs } from "util";
const { values } = parseArgs({
    args: Bun.argv,
    options: {
        "no-release": {
            type: "boolean",
        },
    },
    strict: true,
    allowPositionals: true,
});

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
    sourcemap: "none",
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

    if (!values["no-release"]) await packOutputs(serverDir);
} else {
    console.error("❌ Failed to build server:", result.logs);
}

export {};
