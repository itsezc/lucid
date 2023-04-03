import { Model } from "./model.js";
import { TOmitInternalMethods, TOptionalID, TTimeout } from "./internal.js";

export type SQL = string;

type SQLOptions = {
	subquery?: true;
};

export function sql<T = string>(query: string, options?: SQLOptions): T {
	return query as T;
}

type TRelate<T1 extends Model, T2 extends Model, EdgeProps extends typeof Model> = {
	in: T1;
	out: T2;
	through: EdgeProps;
	content?: {
		[P in keyof TOmitInternalMethods<InstanceType<EdgeProps>>]: InstanceType<EdgeProps>[P];
	};
	timeout?: TTimeout;
	return?: "NONE" | "BEFORE" | "AFTER" | "DIFF";
	parallel?: boolean;
};
