export class SurealString {
	public static concat(str: string) {
		return `string::concat(${str})`;
	}

	public static endsWith(str: string, str2: string) {
		return `string::endsWith('${str}', '${str2}')`;
	}

	public static join(str: string) {
		return `string::join(${str})`;
	}

	// @ts-ignore
	public static length(str: string) {
		return `string::length(${str})`;
	}

	public static lowercase(str: string) {
		return `string::lowercase(${str})`;
	}

	public static repeat(str: string, times: number) {
		return `string::repeat('${str}', ${times})`;
	}

	public static replace(str: string, find: string, replace: string) {
		return `string::replace('${str}', '${find}', '${replace}')`;
	}

	public static reverse(str: string) {
		return `string::reverse('${str}')`;
	}

	public static slice(str: string) {
		return `string::slice(${str})`;
	}

	public static slug(str: string) {
		return `string::slug(${str})`;
	}

	public static split(str: string) {
		return `string::split(${str})`;
	}

	public static startsWith(str: string) {
		return `string::startsWith(${str})`;
	}

	public static trim(str: string) {
		return `string::trim(${str})`;
	}

	public static uppercase(str: string) {
		return `string::uppercase(${str})`;
	}

	public static words(str: string) {
		return `string::words(${str})`;
	}
}
