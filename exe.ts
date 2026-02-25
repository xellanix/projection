import version from "./frontend/data/version.json";

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
            copyright: "Copyright (c) 2025, Xellanix",
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
    console.log("Build successful: ", result.outputs[0].path);
}

export {};
