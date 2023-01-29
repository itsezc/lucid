import { DateTime, Decimal, Float, GeoLine, GeoMultiLine, GeoMultiPoint, GeoMultiPolygon, GeoPoint, GeoPolygon, Model } from '..';
import { SurrealString } from '../utilities/string';

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

type TGeoPoint = {
	type: 'Point',
	coordinates: [number, number]
};

type TGeoLineString = {
	type: 'LineString',
	coordinates: number[][]
};

type TGeoPolygon = {
	type: 'Polygon',
	coordinates: number[][][]
};

type TGeoMultiPoint = {
	type: 'MultiPoint',
	coordinates: number[][]
};

type TMultiLineString = {
	type: 'MultiLinestring',
	coordinates: number[][][]
};

type TMultiPolygon = {
	type: 'MultiPolygon',
	coordinates: number[][][][]
};

type TGeometryCollection = {
	type: 'GeometryCollection',
	geometries: TGeoPoint | TGeoLineString | TGeoPolygon | TGeoMultiPoint | TMultiLineString | TMultiPolygon[];
}

type TUtilGeoType = TGeoPoint 
	| TGeoLineString 
	| TGeoPolygon 
	| TGeoMultiPoint 
	| TMultiLineString 
	| TMultiPolygon;

type TGeoOps = {
	inside?: TUtilGeoType;
	notInside?: TUtilGeoType;
	outside?: TUtilGeoType;
	intersects?: TUtilGeoType;
};

type TNumberWhereOps = TNumberOps | number;
type TDateTimeWhereOps = TDateTimeOps | DateTime;
type TStringWhereOps = TStringOps | string;

type TGeoWhereOps = TGeoOps | GeoPoint;

type ObjectOps<T> = Partial<{
	[P in keyof T]: T[P] extends Decimal ? TNumberWhereOps
		: T[P] extends Float ? TNumberWhereOps
		: T[P] extends Date ? TDateTimeWhereOps
		: T[P] extends DateTime ? TDateTimeWhereOps
		: T[P] extends 
			GeoPoint
			| TGeoLineString
			| GeoPolygon
			| GeoMultiPoint
			| GeoMultiLine
			| GeoMultiPolygon ? TGeoWhereOps
		: T[P] extends Array<infer U> ? Array<ObjectOps<U>>
		: T[P] extends Model ? { $: ObjectOps<T[P]> }
		: T[P] extends object ? ObjectOps<T[P]>
		: T[P] extends boolean ? boolean
		: T[P] extends string ? TStringWhereOps
		: T[P] extends number ? TNumberWhereOps
		: never
}>;

export type TSubModelWhere<T extends Model> = ObjectOps<T> & {
	OR?: TSubModelWhere<T>
};

const operators = ['gt', 'gte', 'lt', 'lte', 'eq', 'endsWith', 'startsWith', 'contains'];

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
		
		key = options.overrides ?? 
			(options.prefix ? `${options.prefix}.${key}` : key)
				.replaceAll('$.', '');

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

				const isRecord = Object.getOwnPropertyNames((value as object)).includes('$');

				const isCompObj = !isOR && Object.getOwnPropertyNames((value as object)).some(v => operators.includes(v));
				
				const isInlineObjArr = !isOR && Array.isArray(value);
			
				const isInlineObj = !isOR && !isRecord && !isInlineObjArr && !isCompObj;

				// console.log({ key, isOR, isCompObj, isInlineObj, isInlineObjArr, isRecord });

				const parsedValue = value.gt ? `${key} > '${cleanValue(value.gt)}'`
					: value.gte ? `${key} >= '${cleanValue(value.gte)}'`
					: value.lt ? `${key} < '${cleanValue(value.lt)}'`
					: value.lte ? `${key} <= '${cleanValue(value.lte)}'`
					: value.eq ? `${key} = '${cleanValue(value.eq)}'`
					: value.contains ? `${key} ∋ '${cleanValue(value.contains)}'`
					: value.endsWith ? SurrealString.endsWith(key, value.endsWith)
					: isOR ? ` OR (${WhereToSQL(value, { OR: true })})`
					: isCompObj ? `${key} = ${WhereToSQL(value, { object: true })}`
					: isInlineObjArr ? WhereToSQL(value, { object: true, overrides: `${key}.*` })
					: WhereToSQL(value, { object: true, prefix: key });

				sql += `${parsedValue}`
			
				break;
				
			default:
				break;
		}

		if (index !== entries.length - 1 && entries[index + 1][0] !== 'OR')
			sql += ' AND ';
	});

	return sql;
}

function cleanValue(value: Date | unknown) {
	if (value instanceof Date) return value.toISOString();
	return value;
}