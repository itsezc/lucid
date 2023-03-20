import { ISurrealScope } from './scope';
import { ISurrealConnector, TAuthErrorResponse, TAuthSuccessResponse, TExtractVars } from './client.interface';

import { TCredentialDetails, TTokenAuth } from './types';

export class SurrealRest implements ISurrealConnector {
	private authType: 'root' | 'ns' | 'db' | 'scope' | 'token' = 'root';

	constructor(public host: string, private creds: TCredentialDetails) {
		this.creds = creds;
	}

	//Using a token must be done within the query method since this connector is stateless.
	async query<T>(query: string) {
		let Authorization: string | undefined = undefined;

		switch (this.authType) {
			case 'token':
				Authorization = `Bearer ${'token' in this.creds ? this.creds.token : ''}`;
				break;

			case 'root':
				if ('user' in this.creds && 'pass' in this.creds) {
					Authorization = `Basic ${Buffer.from(`${this.creds.user}:${this.creds.pass}`).toString('base64')}`;
				}
				break;
			case 'ns':
			case 'db':
				if ('user' in this.creds && 'pass' in this.creds) {
					Authorization = `Basic ${Buffer.from(`${this.creds.user}:${this.creds.pass}`).toString('base64')}`;
				}
				break;

			case 'scope':
				// @ts-ignore
				await this.signin<{}>({ ...this.creds });
				break;

			default:
				break;
		}

		const DB = 'DB' in this.creds ? this.creds.DB : undefined;
		const NS = 'NS' in this.creds ? this.creds.NS : undefined;

		const res = await fetch(`${this.host}/sql`, {
			method: 'POST',
			headers: {
				Accept: 'application/json',
				Authorization: Authorization as string,
				DB: DB as string,
				NS: NS as string,
			},
			body: query,
		});

		const json = await res.json<T[]>();

		return json;
	}

	async signin<S extends ISurrealScope<unknown, {}>>(args: TExtractVars<S>) {
		//Strip out the $ from the request (Surreal does not expect it from the REST api).
		const surrealArgs = Object.fromEntries(Object.entries(args).map(([key, value]) => [key.replace('$', ''), value]));

		const res = await fetch(`${this.host}/signin`, {
			method: 'POST',
			headers: {
				Accept: 'application/json',
			},
			body: JSON.stringify({
				ns: 'NS' in this.creds ? this.creds.NS : '',
				db: 'DB' in this.creds ? this.creds.DB : '',
				sc: 'SC' in this.creds ? this.creds.SC : '',
				...surrealArgs,
			}),
		});

		const responseJson: TAuthSuccessResponse | TAuthErrorResponse = await res.json();

		//'NS' in this.creds ? this.creds.NS :''

		if (responseJson.code === 200) {
			'token' in this.creds ? (this.creds.token = responseJson.token) : undefined;
		} else throw new Error(responseJson.description);
	}

	async signup<Args extends object, ResponseObj>(args: Args) {
		//Strip out the $ from the request (Surreal does not expect it from the REST api).
		const surrealArgs = Object.fromEntries(Object.entries(args).map(([key, value]) => [key.replace('$', ''), value]));

		const res = await fetch(`${this.host}/signup`, {
			method: 'POST',
			headers: {
				Accept: 'application/json',
			},
			body: JSON.stringify({
				ns: 'NS' in this.creds ? this.creds.NS : '',
				db: 'DB' in this.creds ? this.creds.DB : '',
				sc: 'SC' in this.creds ? this.creds.SC : '',
				...surrealArgs,
			}),
		});

		const responseJson: TAuthSuccessResponse | TAuthErrorResponse = await res.json();

		if (responseJson.code === 200) {
			'token' in this.creds ? (this.creds.token = responseJson.token) : undefined;
		} else throw new Error(responseJson.description);
	}
}
