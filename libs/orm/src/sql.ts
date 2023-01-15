export type SQL = string;

export function sql<T = string>(query: string): T {
	return query as T;
}
