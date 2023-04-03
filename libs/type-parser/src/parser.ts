import { ClassDeclaration, PropertyLike, Type, parseFromGlob, ClassMemberLike } from "@ts-ast-parser/core";
import ts, { ModuleKind, ModuleResolutionKind, ScriptTarget } from "typescript";
import tsConfig from "../tsconfig.json";
import fs from "fs";
import { ITableFieldProps, Model } from "@lucid-framework/orm";
import { TableJson } from "./types.js";
const primitives = ["string", "number", "boolean", "bigint", "symbol", "undefined", "null", "any", "unknown"];

const getType = (type: Type, isRelational: boolean) => {
	if (!type?.text) return;
	let rep = type.text;
	const isArray = type.text.includes("[]");
	const isEnum = type.text.includes("|");
	const isObject = type.text.includes("{");
	const isPrimitive = primitives.includes(type.text);
	const isDate = type.text.includes("Date");
	if (isArray) rep = type.text.replace("[]", "");
	// if (isObject) rep = "object";
	if (isPrimitive) rep = type.text;
	if (isEnum) rep = rep.replace(/\|/g, ",");

	return {
		type: rep,
		isArray,
		isObject,
		isPrimitive,
		isRelational,
		isEnum,
		isDate,
	};
};

const insertMissingQuotes = (str: string) => {
	return str.replace(/(['"])?([a-z0-9A-Z_]+)(['"])?:/g, '"$2": ');
};
const replaceSingleQuotes = (str: string) => {
	return str.replace(/'/g, '"');
};

export function parseTypes(pathLike: string | string[], output?: string, options?: ts.CompilerOptions) {
	const multiple = false; // Array.isArray(path);

	const metadata = parseFromGlob(pathLike, {
		experimentalDecorators: true,
		resolvePackageJsonImports: false,
		resolvePackageJsonExports: false,
		skipDefaultLibCheck: true,
		resolveJsonModule: true,
		target: ScriptTarget.ESNext,
		moduleResolution: ModuleResolutionKind.NodeNext,
		module: ModuleKind.NodeNext,
		types: ["bun-types"],
		...options,
		...tsConfig,
		noEmit: true,
	} as any);

	const organized = metadata.map((model) => {
		return model.declarations.map((objs) => {
			if (objs.kind !== "class") return;
			const members = (objs as ClassDeclaration).members;
			const fields =
				members?.map((props) => {
					if (props.kind !== "field") return;
					const field = props as PropertyLike & ClassMemberLike;
					const decorators = field.decorators?.map((deco) => {
						return {
							name: deco.name,
							arguments: deco.arguments?.map((arg) => {
								const auged = replaceSingleQuotes(insertMissingQuotes(arg as string));
								if (!auged) return;
								if (auged.includes("=>")) {
									return {};
								}
								const argum = JSON.parse(auged as string) as ITableFieldProps<Model>;
								return {
									index: argum?.index,
									flexible: argum?.flexible,
									name: argum?.name,
								};
							}),
						};
					});
					const isRelational = decorators?.some((d) => d.name === "FieldRelation") ?? false;
					return {
						name: props.name,
						type: getType(field.type, isRelational),
						modifer: field?.modifier,
						decorators: decorators,
					};
				}) ?? [];

			const flattenedFields = fields.flat(2);
			const filteredFields = flattenedFields.filter((f) => f);
			const furtherOrganizedFields = filteredFields.reduce((acc, curr) => {
				if (!curr) return acc;
				//@ts-ignore
				acc[curr.name] = curr;
				return acc;
			}, {}) as Record<string, any>;
			return {
				name: objs.name,
				isTable: objs.decorators?.some((c) => c.name === "Table"),
				fields: furtherOrganizedFields,
			};
		});
	});
	// first flatten
	const flattened = organized.flat(2);
	// then filter out undefined
	const filtered = flattened.filter((f) => f);
	// then map to object
	const furtherOrganized = filtered.reduce((acc, curr) => {
		if (!curr) return acc;
		//@ts-ignore
		acc[curr.name] = curr;
		return acc;
	}, {}) as TableJson;

	if (!output) return furtherOrganized;
	const currentDir = process.cwd();
	const outputDir = `${currentDir}/node_modules/@lucid-framework/orm/model_types`;
	if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);
	const pouts = output.split("/");
	const outputLocation = `${outputDir}/${pouts[pouts.length - 1]}.json`;

	console.log(`Writing to ${outputLocation}...`);

	Bun.write(`${outputLocation}`, JSON.stringify(furtherOrganized, null, 2));

	return furtherOrganized;
}
