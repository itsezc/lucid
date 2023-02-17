export class Crypto {
	/**
	 * The `crypto::md5` function returns the md5 hash of the input value.
	 */
	public static md5(value: string) {
		return `crypto::md5(${value.toString()})`;
	}

	/**
	 * The `crypto::sha1` function returns the sha1 hash of the input value.
	 */
	public static sha1(value: string) {
		return `crypto::sha1(${value.toString()})`;
	}

	/**
	 * The `crypto::sha256` function returns the sha256 hash of the input value.
	 */
	public static sha256(value: string) {
		return `crypto::sha256(${value.toString()})`;
	}

	/**
	 * The `crypto::sha512` function returns the sha512 hash of the input value.
	 */
	public static sha512(value: string) {
		return `crypto::sha512(${value.toString()})`;
	}

	/**
	 * The `crypto::argon2::compare` function compares a hashed-and-salted argon2 password value with an unhashed password value.
	 */
	public static argon2_compare(hash: string, to: string) {
		return `crypto::argon2::compare(${hash.toString()}, ${to.toString()})`;
	}

	/**
	 * The `crypto::argon2::generate` function hashes and salts a password using the argon2 hashing algorithm.
	 */
	public static argon2_generate(value: string) {
		return `crypto::argon2::generate(${value.toString()})`;
	}

	/**
	 * The `crypto::pbkdf2::compare` function compares a hashed-and-salted pbkdf2 password value with an unhashed password value.
	 */
	public static pbkdf2_compare(hash: string, to: string) {
		return `crypto::pbkdf2::compare(${hash.toString()}, ${to.toString()})`;
	}

	/**
	 * The `crypto::pbkdf2::generate` function hashes and salts a password using the pbkdf2 hashing algorithm.
	 */
	public static pbkdf2_generate(value: string) {
		return `crypto::pbkdf2::generate(${value.toString()})`;
	}

	/**
	 * The `crypto::scrypt::compare` function compares a hashed-and-salted scrypt password value with an unhashed password value.
	 */
	public static scrypt_compare(hash: string, to: string) {
		return `crypto::scrypt::compare(${hash.toString()}, ${to.toString()})`;
	}

	/**
	 * The `crypto::scrypt::generate` function hashes and salts a password using the scrypt hashing algorithm.
	 */
	public static scrypt_generate(value: string) {
		return `crypto::scrypt::generate(${value.toString()})`;
	}
}
