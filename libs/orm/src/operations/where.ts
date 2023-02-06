import { type Types, IModel, Lucid } from '..';
import { stringifyToSQL } from '../util';
import { OfArray } from '../utilities/helper.types';
import { SString } from '../utilities/string';

type TDateTimeOps = {
	eq?: Types.SDateTime;
	gt?: Types.SDateTime;
	gte?: Types.SDateTime;
	lt?: Types.SDateTime;
	lte?: Types.SDateTime;
};

type TNumberOps = {
	eq?: number;
	gt?: number;
	gte?: number;
	lt?: number;
	lte?: number;
};

type TStringOps = {
	eq?: string;
	contains?: string;
	startsWith?: string;
	endsWith?: string;
};

type TGeoPoint = {
	type: 'Point';
	coordinates: [number, number];
};

type TGeoLineString = {
	type: 'LineString';
	coordinates: number[][];
};

type TGeoPolygon = {
	type: 'Polygon';
	coordinates: number[][][];
};

type TGeoMultiPoint = {
	type: 'MultiPoint';
	coordinates: number[][];
};

type TMultiLineString = {
	type: 'MultiLinestring';
	coordinates: number[][][];
};

type TMultiPolygon = {
	type: 'MultiPolygon';
	coordinates: number[][][][];
};

type TGeometryCollection = {
	type: 'GeometryCollection';
	geometries: TGeoPoint | TGeoLineString | TGeoPolygon | TGeoMultiPoint | TMultiLineString | TMultiPolygon[];
};

type TUtilGeoType = TGeoPoint | TGeoLineString | TGeoPolygon | TGeoMultiPoint | TMultiLineString | TMultiPolygon;

type TGeoOps = {
	inside?: TUtilGeoType;
	notInside?: TUtilGeoType;
	outside?: TUtilGeoType;
	intersects?: TUtilGeoType;
};

type TNumberWhereOps = TNumberOps | number;
type TDateTimeWhereOps = TDateTimeOps | Types.SDateTime;
type TStringWhereOps = TStringOps | string;
type TGeoWhereOps = TGeoOps | Types.SGeoPoint;

type ObjectOps<T> = Partial<{
	[P in keyof T]: T[P] extends string
		? TStringWhereOps
		: T[P] extends Types.SDecimal
		? TNumberWhereOps
		: T[P] extends Types.SFloat
		? TNumberWhereOps
		: T[P] extends Date
		? TDateTimeWhereOps
		: T[P] extends Types.SDateTime
		? TDateTimeWhereOps
		: T[P] extends Types.SGeoPoint | Types.SGeoLine | Types.SGeoPolygon | Types.SGeoMultiPoint | Types.SGeoMultiLine | Types.SGeoMultiPolygon
		? TGeoWhereOps
		: T[P] extends number
		? TNumberWhereOps
		: OfArray<T[P]> extends { type: infer U }
		? U extends IModel
			? { $: ObjectOps<U> }
			: ObjectOps<U>
		: T[P] extends IModel
		? { $: ObjectOps<T[P]> }
		: T[P] extends object
		? ObjectOps<T[P]>
		: T[P] extends boolean
		? boolean
		: never;
}>;

export type TSubModelWhere<T extends IModel> = ObjectOps<T> & {
	OR?: TSubModelWhere<T>;
};

const operators = ['gt', 'gte', 'lt', 'lte', 'eq', 'endsWith', 'startsWith', 'contains'];

export function WhereToSQL<SubModel extends IModel>(
	table: string,
	where: TSubModelWhere<SubModel> | object,
	options: {
		OR?: boolean;
		object?: boolean;
		prefix?: string;
		overrides?: string;
	} = {
		OR: false,
		object: false,
	},
) {
	let sql = '';

	let orStatements: string[] = [];

	const entries = Object.entries(where);

	entries.forEach(([key, value], index) => {
		key = options.overrides ?? (options.prefix ? `${options.prefix}.${key}` : key).replaceAll('$.', '');

		const metadata = Lucid.get(table)?.fields || [];
		const metadataFilter = metadata.filter((x) => x.from === key) || [];

		key = metadataFilter.length > 0 ? metadataFilter[0].to : key;

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
				const isRecord = Object.getOwnPropertyNames(value as object).includes('$');
				const isCompObj = !isOR && Object.getOwnPropertyNames(value as object).some((v) => operators.includes(v));
				const isInlineObjArr = !isOR && Array.isArray(value);
				const isInlineObj = !(isOR || isRecord || isInlineObjArr || isCompObj);

				// Check if multiple conditions apply to the object
				const valueKeys = Object.keys(value);
				const hasMultiple = valueKeys.length > 1;
				const isLastMultiple = index === value.length - 1;

				// console.log(hasMultiple, key, isLastMultiple);

				// console.log({ key, isOR, isCompObj, isInlineObj, isInlineObjArr, isRecord });

				// Is inline or inline comparison object
				if (!(isOR || isCompObj || isInlineObjArr)) {
					if (value.eq) sql += `${key} = ${cleanValue(value.eq)}`;
					if (value.gt) sql += `${key} > ${cleanValue(value.gt)}`;
					if (value.lt) sql += `${key} < ${cleanValue(value.lt)}`;
					if (value.lte) sql += `${key} <= ${cleanValue(value.lte)}`;
					if (value.gte) sql += `${key} >= ${cleanValue(value.gte)}`;
					if (value.inside) sql += `${key} INSIDE ${stringifyToSQL(value.inside)}`;
					if (value.outside) sql += `${key} OUTSIDE ${stringifyToSQL(value.outside)}`;
					if (value.contains) sql += `${key} ∋ '${cleanValue(value.contains)}'`;
					if (value.endsWith) sql += SString.endsWith(key, value.endsWith);
					if (value.startsWith) sql += SString.startsWith(key, value.startsWith);
				} else {
					const parsedValue = isOR
						? ` OR (${WhereToSQL(value, { OR: true })})`
						: isCompObj
						? `${key} = ${WhereToSQL(value, { object: true })}`
						: isInlineObjArr
						? WhereToSQL(value, { object: true, overrides: `${key}.*` })
						: WhereToSQL(value, { object: true, prefix: key });

					sql += `${parsedValue}`;
				}
				break;

			default:
				break;
		}

		if (index !== entries.length - 1 && entries[index + 1][0] !== 'OR') sql += ' AND ';
	});

	return sql;
}

function cleanValue(value: Date | unknown) {
	if (value instanceof Date) return value.toISOString();
	return value;
}
