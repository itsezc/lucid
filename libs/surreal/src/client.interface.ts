import { ISurrealScope } from './scope';

export type TExtractVars<T extends ISurrealScope<unknown, {}>> = T extends ISurrealScope<infer V, {}> ? Partial<V> : never;
export type SurrealResponse<T> = {
	time: string;
	status: string;
	result: T;
};
export interface ISurrealConnector {
	query<T>(query: string): Promise<Array<SurrealResponse<T>>>;

	signin<S extends ISurrealScope<unknown, {}>>(scope: S, args: TExtractVars<S>): void;
	signup<S extends ISurrealScope<unknown, {}>>(scope: S, args: TExtractVars<S>): void;
}

export type TAuthSuccessResponse = {
	code: 200;
	details: string;
	token: string;
};

export type TAuthErrorResponse = {
	code: 403;
	details: string;
	description: string;
	information: string;
};
