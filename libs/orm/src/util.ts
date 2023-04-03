export function toSnakeCase(name: string): string {
	let newName = "";
	for (let i = 0; i < name.length; i++) {
		if (name[i] === name[i].toUpperCase()) {
			if (i === 0) {
				newName += name[i].toLowerCase();
			} else {
				newName += `${name.includes("_") ? name[i].toLowerCase() : `_${name[i].toLowerCase()}`}`;
			}
		} else {
			newName += name[i];
		}
	}
	return newName;
}

export function joinRangeFields(arr?: string[][] | number[]) {
	if (!arr) return "";

	if (arr[0] instanceof Array) {
		let res = `['${arr[0].join("', '")}']`;
		for (let i = 1; i < arr.length; i++) {
			res += `..['${(arr[i] as string[]).join("', '")}']`;
		}
		return res;
	} else {
		const seperator = "..";
		let res = "";
		for (let i = arr.length; i--; ) res = (i ? seperator : "") + arr[i] + res;
		return res;
	}
}

export function escapeString(text?: string): string | void {
	if (text) {
		return text.replaceAll("'", "").replaceAll('"', "");
	}

	return;
}

export function stringifyToSQL(obj_from_json: any): string {
	if (obj_from_json instanceof Date) return `'${obj_from_json.toISOString()}'`;
	if (typeof obj_from_json !== "object" || Array.isArray(obj_from_json)) {
		// not an object, stringify using native function
		// do not stringify ids such user:123123, post:something
		if (typeof obj_from_json === "string" && obj_from_json.includes(":")) return obj_from_json;
		if (obj_from_json instanceof Array) {
			return `[${obj_from_json.map((item) => stringifyToSQL(item)).join(", ")}]`;
		}
		return JSON.stringify(obj_from_json, null, 4);
	}

	// Implements recursive object serialization according to JSON spec
	// but without quotes around the keys.
	const props = Object.keys(obj_from_json)
		// @ts-ignore
		.map((key) => `${key}: ${stringifyToSQL(obj_from_json[key])}`)
		.join(", ");

	return `{ ${props} }`;
}
