const result = await Bun.build({
	entrypoints: ["./server/index.ts"],
	compile: {
		target: "bun-windows-x64",
		outfile: "./dist/server/my-app",
		execArgv: ["--smol"],
		autoloadDotenv: false,
		autoloadBunfig: false,
	},
	minify: true,
	sourcemap: "linked",
	bytecode: true,
	define: {
		"process.env.NODE_ENV": JSON.stringify("production"),
		VERSION: JSON.stringify("1.0.0"),
	},
});

if (result.success) {
	console.log("Build successful:", result.outputs[0].path);
}

export {};
