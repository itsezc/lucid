import { DateTime, Decimal, Float, Model } from './';

type TModelProperties<SubModel extends Model> = {
	[P in keyof Omit<SubModel, 'save' | 'getTableName'>]: SubModel[P];
};

export type TQueryArgs<SubModel extends Model> = {
	range?: string[][] | number[];
	where?: Partial<TModelProperties<SubModel>>;
	timeout?: `${number}s`;
};

type TQueryArgInt = {};

type TDateTimeOps = {
	eq?: DateTime, 
	gt?: DateTime, 
	gte?: DateTime, 
	lt?: DateTime, 
	lte?: DateTime
}

type TNumberOps = {
	eq?: number, 
	gt?: number, 
	gte?: number, 
	lt?: number, 
	lte?: number
};

type TStringOps = {
	eq?: string, 
	contains?: string, 
	startsWith?: string, 
	endsWith?: string
};

type TNumberWhereOps = TNumberOps | number;
type TDateTimeWhereOps = TDateTimeOps | DateTime;
type TStringWhereOps = TStringOps | string;

type ObjectOps<T> = Partial<{
	[P in keyof T]: 
		T[P] extends number ? TNumberWhereOps
		: T[P] extends Decimal ? TNumberWhereOps
		: T[P] extends Float ? TNumberWhereOps
		: T[P] extends DateTime ? TDateTimeWhereOps
		: T[P] extends string ? TStringWhereOps
		: T[P] extends object ? ObjectOps<T[P]>
		: T[P] extends boolean ? boolean
		: never
}>;

export type TSubModelWhere<T extends Model> = ObjectOps<T> & {
	OR?: TSubModelWhere<T>
};
