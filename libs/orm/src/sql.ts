import { Model } from './model';
import { TOmitInternalMethods, TOptionalID, TTimeout } from './internal';

export type SQL = string;

type SQLOptions = {
	subquery?: true;
}

export function sql<T = string>(query: string, options?: SQLOptions): T {
	return query as T;
}

type TRelate<
	T1 extends Model, 
	T2 extends Model, 
	EdgeProps extends typeof Model,
> = {
	in: T1;
	out: T2;
	through: EdgeProps;
	content?: {
		[P in keyof TOmitInternalMethods<InstanceType<EdgeProps>>]: InstanceType<EdgeProps>[P]
	};
	timeout?: TTimeout;
	return?: 'NONE' | 'BEFORE' | 'AFTER' | 'DIFF';
	parallel?: boolean;
}

export function relate2<
	T1 extends Model, 
	T2 extends Model, 
	EdgeProps extends typeof Model
>(args: TRelate<T1, T2, EdgeProps>) {}
