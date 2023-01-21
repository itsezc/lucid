export type SQL = string;

type SQLOptions = {
	subquery?: true;
}

export function sql<T = string>(query: string, options?: SQLOptions): T {
	return query as T;
}
