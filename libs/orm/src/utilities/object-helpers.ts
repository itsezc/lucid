export function deepCopyProperties(target: any, source: any) {
	for (const key in source) {
		if (source.hasOwnProperty(key)) {
			const value = source[key];

			if (value instanceof Date) {
				target[key] = new Date(value.getTime());
			} else if (typeof value === "object" && value !== null) {
				target[key] = Array.isArray(value) ? [] : {};
				deepCopyProperties(target[key], value);
			} else {
				target[key] = value;
			}
		}
	}
}
