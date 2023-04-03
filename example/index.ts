import { parseTypes } from "@lucid-framework/type-parser";

const path = ["./src/models/user.ts"];
const output = "model_types";
import { ModuleKind, ModuleResolutionKind, ScriptTarget } from "typescript";

parseTypes(path, output, {
	experimentalDecorators: true,
	resolvePackageJsonImports: false,
	resolvePackageJsonExports: false,
	skipDefaultLibCheck: true,
	resolveJsonModule: true,
	target: ScriptTarget.ESNext,
	moduleResolution: ModuleResolutionKind.NodeNext,
	module: ModuleKind.NodeNext,
	types: ["bun-types"],
	// checkJs: false,
	// ...(config as any),
	// lib: ["esnext"],
});
