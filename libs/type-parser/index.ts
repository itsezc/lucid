import { command, string, positional, run, optional } from "cmd-ts";
import { Directory } from "cmd-ts/batteries/fs";
import { parseTypes } from "./src/parser.js";

export * from "./src/index.js";

const app = command({
	name: "lucid-types",
	args: {
		path: positional({
			type: string,
			description: "Path to file or glob, e.g. ./src/**/*.ts or user.ts,post.ts",
			displayName: "path",
		}),
		outputName: positional({
			type: optional(string),
			description: "Output file",
			displayName: "output",
		}),
	},
	handler: async ({ path, outputName }) => {
		// process.chdir(path);
		// path += "/*.ts";

		// function findTsConfig() {
		// 	const tsConfig = Bun.f.findUpSync("tsconfig.json");
		// 	if (!tsConfig) throw new Error("tsconfig.json not found");
		// 	return tsConfig;
		// }

		console.log(`Parsing types from ${path}...`);
		try {
			let time;
			if (path.includes(",")) {
				const multiPath = path.split(",");
				parseTypes(multiPath, outputName ?? "model_types");
			} else {
				parseTypes(path, outputName ?? "model_types");
			}
		} catch (error) {
			console.error(error);
		}
	},
});

run(app, process.argv.slice(2));
