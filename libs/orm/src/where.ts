import { DateTime, Decimal, Float, Model } from './';

type TModelProperties<SubModel extends Model> = {
	[P in keyof Omit<SubModel, 'save' | 'getTableName'>]: SubModel[P];
};

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
	[P in keyof T]:  T[P] extends Decimal ? TNumberWhereOps
		: T[P] extends Float ? TNumberWhereOps
		: T[P] extends Date ? TDateTimeWhereOps
		: T[P] extends DateTime ? TDateTimeWhereOps
		: T[P] extends Array<infer U> ? ObjectOps<U>
		: T[P] extends object ? ObjectOps<T[P]>
		: T[P] extends boolean ? boolean
		: T[P] extends string ? TStringWhereOps
		: T[P] extends number ? TNumberWhereOps
		: never
}>;

export type TSubModelWhere<T extends Model> = ObjectOps<T> & {
	OR?: TSubModelWhere<T>
};

const operators = ['gt', 'gte', 'lt', 'lte', 'eq', 'endsWith', 'startsWith'];

export function WhereToSQL<SubModel extends Model>(
	where: TSubModelWhere<SubModel> | object, 
	options: {
		OR?: boolean,
		object?: boolean,
		prefix?: string
	} = {
		OR: false,
		object: false,
	}
) {
	let sql = '';

	const entries = Object.entries(where);

	entries.forEach(([key, value], index) => {
		value = cleanValue(value);

		switch (typeof value) {
			case 'string':
				sql += `${key} = '${value}'`;
				break;
			
			case 'boolean':
			case 'number':
				sql += `${key} = ${value}`;
				break;

			case 'object':
				const isOR = key === 'OR';

				const isCompObj = !isOR && Object.getOwnPropertyNames((value as object)).some(v => operators.includes(v));

				const isInlineObj = !isCompObj && (options.object || typeof value === 'object');

				// const isRecord = !isInlineObj
				// 	&&  Object.getOwnPropertyNames((value as object)).some(v => operators.includes(v));

				// console.log({key, isOR, isCompObj, isInlineObj });

				const prefixedKey = options.object 
					&& options.prefix ? `${options.prefix}.${key}` : key;

				const parsedValue = value.gt ? `${prefixedKey} > '${cleanValue(value.gt)}'`
					: value.gte ? `${prefixedKey} >= '${cleanValue(value.gte)}'`
					: value.lt ? `${prefixedKey} < '${cleanValue(value.lt)}'`
					: value.lte ? `${prefixedKey} <= '${cleanValue(value.lte)}'`
					: value.eq ? `${prefixedKey} = '${cleanValue(value.eq)}'`
					: isOR ? `OR (${WhereToSQL(value, { OR: true })})`
					: isCompObj ? `${prefixedKey} = ${WhereToSQL(value, { object: true, prefix: prefixedKey })}`
					: WhereToSQL(value, { object: true, prefix: prefixedKey });

				sql += `${parsedValue}`
			
				break;
				
			default:
				break;
		}

		if (index !== entries.length - 1) sql += ', ';
	});

	return sql;
}

function cleanValue(value: Date | unknown) {
	if (value instanceof Date) return value.toISOString();
	return value;
}