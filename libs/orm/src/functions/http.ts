type HTTPHeaders = Record<string, string>;

export class HTTP {
	/**
	 *	The `http::head` function performs a remote HTTP `HEAD` request. The first parameter is the URL of the remote endpoint. If the response does not return a `2XX` status code, then the function will fail and return the error.
	 */
	public static head(endpoint: string, headers?: HTTPHeaders) {
		return `http::head(${endpoint.toString()}${
			headers ? `, ${JSON.stringify(headers)}` : ''
		})`;
	}

	/**
	 *	The `http::get` function performs a remote HTTP `GET` request. The first parameter is the URL of the remote endpoint. If the response does not return a `2XX` status code, then the function will fail and return the error. If the remote endpoint returns an `application/json content-type`, then the response is parsed and returned as a value, otherwise the response is treated as text.
	 */
	public static get(endpoint: string, headers?: HTTPHeaders) {
		return `http::put(${endpoint.toString()}${
			headers ? `, ${JSON.stringify(headers)}` : ''
		})`;
	}

	/**
	 *	The `http::put` function performs a remote HTTP `PUT` request. The first parameter is the URL of the remote endpoint, and the second parameter is the value to use as the request body, which will be converted to JSON. If the response does not return a `2XX` status code, then the function will fail and return the error. If the remote endpoint returns an `application/json` content-type, then the response is parsed and returned as a value, otherwise the response is treated as text.
	 */
	public static put(
		endpoint: string,
		body: HTTPHeaders,
		headers?: HTTPHeaders,
	) {
		return `http::put(${endpoint.toString()}, ${JSON.stringify(body)}${
			headers ? `, ${JSON.stringify(headers)}` : ''
		})`;
	}

	/**
	 * The `http::post` function performs a remote HTTP `POST` request. The first parameter is the URL of the remote endpoint, and the second parameter is the value to use as the request body, which will be converted to JSON. If the response does not return a `2XX` status code, then the function will fail and return the error. If the remote endpoint returns an `application/json` content-type, then the response is parsed and returned as a value, otherwise the response is treated as text.
	 */
	public static post(
		endpoint: string,
		body: HTTPHeaders,
		headers?: HTTPHeaders,
	) {
		return `http::post(${endpoint.toString()}, ${JSON.stringify(body)}${
			headers ? `, ${JSON.stringify(headers)}` : ''
		})`;
	}

	/**
	 * The `http::patch` function performs a remote HTTP `PATCH` request. The first parameter is the URL of the remote endpoint, and the second parameter is the value to use as the request body, which will be converted to JSON. If the response does not return a `2XX` status code, then the function will fail and return the error. If the remote endpoint returns an `application/json` content-type, then the response is parsed and returned as a value, otherwise the response is treated as text.
	 */
	public static patch(
		endpoint: string,
		body: HTTPHeaders,
		headers?: HTTPHeaders,
	) {
		return `http::patch(${endpoint.toString()}, ${JSON.stringify(body)}${
			headers ? `, ${JSON.stringify(headers)}` : ''
		})`;
	}

	/**
	 * The `http::delete` function performs a remote HTTP `DELETE` request. The first parameter is the URL of the remote endpoint. If the response does not return a `2XX` status code, then the function will fail and return the error. If the remote endpoint returns an `application/json` content-type, then the response is parsed and returned as a value, otherwise the response is treated as text.
	 */
	public static delete(endpoint: string, headers?: HTTPHeaders) {
		return `http::delete(${endpoint.toString()}${
			headers ? `, ${JSON.stringify(headers)}` : ''
		})`;
	}
}
