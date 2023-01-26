import { DateTime, Decimal, Float, Model } from './';
import { SurrealString } from './utilities/string';

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
	[P in keyof T]: T[P] extends Decimal ? TNumberWhereOps
		: T[P] extends Float ? TNumberWhereOps
		: T[P] extends Date ? TDateTimeWhereOps
		: T[P] extends DateTime ? TDateTimeWhereOps
		: T[P] extends Array<infer U> ? Array<ObjectOps<U>>
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
		prefix?: string,
		overrides?: string
	} = {
		OR: false,
		object: false,
	}
) {
	let sql = '';

	let orStatements: string[] = [];

	const entries = Object.entries(where);

	entries.forEach(([key, value], index) => {
		
		key = options.overrides ?? (options.prefix ? `${options.prefix}.${key}` : key);
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

				const isInlineObjArr = !isOR && Array.isArray(value);

				// const isRecord = !isInlineObj
				// 	&&  Object.getOwnPropertyNames((value as object)).some(v => operators.includes(v));

				// console.log({key, isOR, isCompObj, isInlineObj });

				const parsedValue = value.gt ? `${key} > '${cleanValue(value.gt)}'`
					: value.gte ? `${key} >= '${cleanValue(value.gte)}'`
					: value.lt ? `${key} < '${cleanValue(value.lt)}'`
					: value.lte ? `${key} <= '${cleanValue(value.lte)}'`
					: value.eq ? `${key} = '${cleanValue(value.eq)}'`
					: value.contains ? `${key} ∋ '${cleanValue(value.contains)}'`
					: value.endsWith ? SurrealString.endsWith(key, value.endsWith)
					: isOR ? `OR (${WhereToSQL(value, { OR: true })})`
					: isCompObj ? `${key} = ${WhereToSQL(value, { object: true })}`
					: isInlineObjArr ? WhereToSQL(value, { object: true, overrides: `${key}.*` })
					: WhereToSQL(value, { object: true, prefix: key });

				sql += `${parsedValue}`
			
				break;
				
			default:
				break;
		}

		if (index !== entries.length - 1) sql += ', ';
	});

	// let conditions = [];
	// let orStatements: string[] = [];

	// function processValue(key: string, value: unknown) {
    //     if (value instanceof Date) {
    //         return `${key} = '${value.toISOString()}'`;
    //     } else if (typeof value === 'object') {
	// 		const parsedValue = value.gt ? `${key} > '${cleanValue(value.gt)}'`
	// 			: value.contains ? `${key} ∋ '${cleanValue(value.contains)}'`
	// 			: value.endsWith ? SurrealString.endsWith(key, value.endsWith)
	// 			: `${key} = ${processValue(key, value)}`;

    //         return `${parsedValue}`;
    //     } else {
    //         return `${key} = ${value}`;
    //     }
    // }

    // for (const key in where) {
    //     if (key === 'OR') orStatements.push(`(${WhereToSQL(where[key])})`);
    //     else {
	// 		conditions.push(processValue(key, where[key]))
    //     }
    // }
    
	// sql += conditions.join(', ');

    // if (orStatements.length > 0) {
    //     sql += ` OR ${orStatements.join(' OR ')}`;
    // }

	return sql;
}

function cleanValue(value: Date | unknown) {
	if (value instanceof Date) return value.toISOString();
	return value;
}

function escaped(str: string) {
	return str.replaceAll('\'', '').replaceAll('"', '');
}