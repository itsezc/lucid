export class Is {
	/**
	 *	The `is::alphanum` function checks whether a value has only alphanumeric characters.
	 */
	public static alphanum(value: string | number) {
		return `is::alphanum(${value.toString()})`;
	}

	/**
	 *	The `is::alpha` function checks whether a value has only alpha characters.
	 */
	public static alpha(value: string) {
		return `is::alpha(${value.toString()})`;
	}

	/**
	 *	The `is::ascii` function checks whether a value has only ascii characters.
	 */
	public static ascii(value: string) {
		return `is::ascii(${value.toString()})`;
	}

	/**
	 *	The `is::domain` function checks whether a value is a domain.
	 */
	public static domain(value: string) {
		return `is::domain(${value.toString()})`;
	}

	/**
	 * The `is::email` function checks whether a value is an email.
	 */
	public static email(value: string) {
		return `is::email(${value.toString()})`;
	}

	/**
	 * The `is::hexadecimal` function checks whether a value is hexadecimal.
	 */
	public static hexadecimal(value: string) {
		return `is::hexadecimal(${value.toString()})`;
	}

	/**
	 *	The `is::latitude` function checks whether a value is a latitude value.
	 */
	public static latitude(value: string) {
		return `is::latitude(${value.toString()})`;
	}

	/**
	 *	The `is::longitude` function checks whether a value is a longitude value.
	 */
	public static longitude(value: string) {
		return `is::longitude(${value.toString()})`;
	}

	/**
	 * The `is::numeric` function checks whether a value has only numeric characters.
	 */
	public static numeric(value: string | number) {
		return `is::numeric(${value.toString()})`;
	}

	/**
	 *	The `is::semver` function checks whether a value matches a semver version.
	 */
	public static semver(value: string) {
		return `is::semver(${value.toString()})`;
	}

	/**
	 *	The `is::uuid` function checks whether a value is a UUID.
	 */
	public static uuid(value: string) {
		return `is::uuid(${value.toString()})`;
	}
}
