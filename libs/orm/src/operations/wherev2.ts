import Lucid, { MetadataFields } from "../lucid.js";
import { IModel } from "../model.js";
import { OfArray } from "../utilities/helper.types.js";

export const QLOperators = {
	equals: "=",
	gt: ">",
	gte: ">=",
	lt: "<",
	lte: "<=",
	eeq: "==",
	any: "?=",
	all: "*=",
	feq: "~",
	fany: "*~",
	contains: "CONTAINS",
	containsAll: "CONTAINSALL",
	containsAny: "CONTAINSANY",
	containsOne: "CONTAINSNONE",
	inside: "INSIDE",
	notInside: "NOTINSIDE",
	allInside: "ALLINSIDE",
	anyInside: "ANYINSIDE",
	noneInside: "NONEINSIDE",
	outside: "OUTSIDE",
	intersects: "INTERSECTS",
};

export type QLOperator = keyof typeof QLOperators;

export type OfDateOrNumberOperators = {
	eq?: number | Date;
	gt?: number | Date;
	gte?: number | Date;
	lt?: number | Date;
	lte?: number | Date;
};

export function isDate(value: any): value is Date {
	return value instanceof Date;
}

export function mapNumberOrDateOperator(value: any, key?: string) {
	if (value?.gt) return `${key ? key : ""} > ${isDate(value.gt) ? value.gt.getTime() : value.gt}`;
	if (value?.lt) return `${key ? key : ""} < ${isDate(value.lt) ? value.lt.getTime() : value.lt}`;
	if (value?.gte) return `${key ? key : ""} >= ${isDate(value.gte) ? value.gte.getTime() : value.gte}`;
	if (value?.lte) return `${key ? key : ""} <= ${isDate(value.lte) ? value.lte.getTime() : value.lte}`;
	return null;
}

export const OfDateOrNumberOperators = ["eq", "gt", "gte", "lt", "lte"] as const;

export type OfStringOperators = {
	eq?: string;
	contains?: string[] | string;
	containsAny?: string[] | string;
	containsAll?: string[] | string;
	containsNone?: string[] | string;
};

export const OfStringOperators = ["eq", "contains", "containsAny", "containsAll", "containsNone"] as const;

export function mapStringOperator(value: any, key?: string) {
	if (value?.contains) {
		if (Array.isArray(value?.contains)) {
			return `${key ? key : ""} CONTAINS [${value.contains.map((v: any) => `"${v}"`).join(",")}]`;
		} else {
			return `${key ? key : ""} CONTAINS "${value.contains}"`;
		}
	}
	if (value?.containsAny) {
		if (Array.isArray(value?.containsAny)) {
			return `${key ? key : ""} CONTAINSANY [${value.containsAny.map((v: any) => `"${v}"`).join(",")}]`;
		} else {
			return `${key ? key : ""} CONTAINSANY "${value.containsAny}"`;
		}
	}
	if (value?.containsAll) {
		if (Array.isArray(value?.containsAll)) {
			return `${key ? key : ""} CONTAINSALL [${value.containsAll.map((v: any) => `"${v}"`).join(",")}]`;
		} else {
			return `${key ? key : ""} CONTAINSALL "${value.containsAll}"`;
		}
	}
	if (value?.containsNone) {
		if (Array.isArray(value?.containsNone)) {
			return `${key ? key : ""} CONTAINSNONE [${value.containsNone.map((v: any) => `"${v}"`).join(",")}]`;
		} else {
			return `${key ? key : ""} CONTAINSNONE "${value.containsNone}"`;
		}
	}
	return null;
}

export type OfBooleanOperators = {
	eq?: boolean;
};

export const OfBooleanOperators = ["eq"] as const;

export function mapBooleanOperator(value: any, key?: string) {
	if (value?.eq) return `${key ? key : ""} = ${value.eq}`;
	return null;
}

export const mapOperator = (value: any, key?: string) => {
	return mapNumberOrDateOperator(value, key) || mapStringOperator(value, key) || mapBooleanOperator(value, key);
};

export type ExtractRelevant<T> = OfArray<T> extends { type: infer U; isPrimitive: infer P }
	? P extends true
		? ExtractRelevant<U>
		: WhereSelector<U>
	: T extends Date | number
	? OfDateOrNumberOperators | ((item: T) => boolean)
	: T extends string
	? OfStringOperators | string
	: T extends boolean
	? boolean
	: T extends object
	? WhereSelector<T>
	: never;

export type WhereSelector<M> = M extends object
	?
			| { AND: WhereSelector<M>[] }
			| { OR: WhereSelector<M>[] }
			| { NOT: WhereSelector<M>[] }
			| Partial<{
					[P in keyof M]: ExtractRelevant<M[P]>;
			  }>
	: never;

export type FieldItem = {
	isRecord: boolean;
	isRelation: boolean;
	isArray: boolean;
	isObject: boolean;
	isDate: boolean;
	isEnum: boolean;
};
export type BasicRelationType = { from: string; to: string; edge: any; tName: string; inverse: boolean };

export type ParentItem = {
	key: string;
	parent: string;
	fieldItem: FieldItem | null;
	relation: BasicRelationType | null;
};

function IsRecord(fieldType: string) {
	if (!fieldType) return false;
	const tables = Array.from(Lucid.keys);
	// check if this field name exists as a table
	return tables.map((x) => x.toLowerCase()).includes(fieldType.toLowerCase());
}

export function WhereFilter<SubModel extends IModel>(table: string, where: WhereSelector<SubModel> | object, previous?: ParentItem, nested?: boolean) {
	let result = "";

	const { AND, OR, NOT, ...rest } = where as any;
	if (rest) {
		const keys = Object.keys(rest);
		for (let i = 0, accepted = 0; i < keys.length; ++i) {
			const key = keys[i];
			if (!key) continue;
			const value = rest[key as keyof typeof rest];
			if (!value) continue;

			const metadata = Lucid.get(table)?.fields || {};
			const metadataFilter =
				key === "id"
					? {
							type: {
								isPrimitive: true,
								isArray: false,
								isObject: false,
								isDate: false,
								isEnum: false,
								type: "string",
								isRelational: false,
							},
					  }
					: (metadata[key] as unknown as MetadataFields<SubModel>);

			const isDate = metadataFilter?.type?.isDate;

			const getKey = () => (previous && !nested ? `${previous.parent}.${key}` : key);
			accepted++;

			if (accepted > 1) result += " AND ";

			const opts = mapOperator(value, getKey());
			if (opts) {
				result += opts;
				continue;
			}

			const isNestedObject = typeof value === "object" && !Array.isArray(value);

			let refTable: string | undefined = undefined;
			const isArray = metadataFilter?.type?.isArray;
			const isObject = metadataFilter?.type?.isObject;
			const isPrimitive = metadataFilter?.type?.isPrimitive;
			const isEnum = metadataFilter?.type?.isEnum;
			const isRecord = IsRecord(metadataFilter?.type?.type);
			const isRelation = metadataFilter?.type?.isRelational ?? false;
			const fieldType = metadataFilter?.type?.type;
			const refName = isNestedObject && isRecord && fieldType ? fieldType : null;

			if (refName) {
				refTable = Lucid.get(refName)?.table.name ? refName : undefined;
			}

			const parentItem = {
				key,
				parent: previous?.parent ? `${previous.parent}.${key}` : key,
				fieldItem: {
					isRecord,
					isRelation,
					isArray,
					isObject,
					isDate,
					isEnum,
				},
			} as ParentItem;

			// console.log(metadata, table, Lucid.get(table));
			// console.log(value, key, isNestedObject, isRecord, isRelation, isPrimitive, isObject, isArray, refTable, isEnum);

			if (isPrimitive || isRecord) {
				if (typeof value === "function") {
					const funcString = value.toString().replace(/\(.*\)\s*=>\s*/, "");
					result += `${funcString}`;
					continue;
				}
				result += `${getKey()} = ${typeof value === "string" && value.includes(":") ? value : JSON.stringify(value)}`;
			} else if (isEnum) {
				result += `${getKey()} = ${typeof value === "string" && value.includes(":") ? value : JSON.stringify(value)}`;
			} else if (isDate) {
				const where = WhereFilter(refTable ?? table, value, parentItem);
				result += where;
			} else if (isObject) {
				const where = WhereFilter(refTable ?? table, value, parentItem);
				result += where;
			} else if (isArray) {
				const where = WhereFilter(refTable ?? table, value, parentItem, true);
				result += `${key}.${where}`;
				// result += `${key}[WHERE ${where.parse()}]`;
			} else {
				console.log("NO FIELD", key, value, table);
			}
		}
		if (AND) {
			result += " AND ";
			if (Array.isArray(AND)) {
				for (let i = 0; i < AND.length; i++) {
					const element = AND[i];
					if (i > 0) result += " AND ";
					result += WhereFilter(table, element, previous);
				}
			} else if (typeof AND === "object") result += WhereFilter(table, AND, previous, nested);
		}
		if (OR) {
			result += " OR ";
			if (Array.isArray(OR)) {
				for (let i = 0; i < OR.length; i++) {
					const element = OR[i];
					if (i > 0) result += " OR ";
					result += WhereFilter(table, element, previous, nested);
				}
			} else if (typeof OR === "object") result += WhereFilter(table, OR, previous, nested);
		}
		if (NOT) {
			result += " NOT ";
			if (Array.isArray(NOT)) {
				for (let i = 0; i < NOT.length; i++) {
					const element = NOT[i];
					if (i > 0) result += " NOT ";
					result += WhereFilter(table, element, previous);
				}
			} else if (typeof NOT === "object") result += WhereFilter(table, NOT, previous, nested);
		}

		return result;
	}
}
