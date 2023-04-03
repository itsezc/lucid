import { Constructor } from "type-fest";
import Lucid, { FieldsType, IFieldRelationProps, ITable, ITableFieldProps, LucidMetadata } from "./lucid.js";
import { Model } from "./model.js";

export type TSurrealFieldIndex = "unique" | boolean;

export type TSurrealDataType =
	| "string"
	| "enum"
	| "bool"
	| "int"
	| "float"
	| "decimal"
	| "datetime"
	| "object"
	| "polygon"
	| "point"
	| "line"
	| "multipoint"
	| "multiline"
	| "multipolygon"
	| "collection"
	| "array"
	| "future"
	| "record";

export type TSurrealDataTypePrimitive = Omit<TSurrealDataType, "future">;

export type TAssertHandler<SubModel> =
	| "alpha"
	| "alphanum"
	| "ascii"
	| "domain"
	| "email"
	| "hexadecimal"
	| "latitude"
	| "longitude"
	| "numeric"
	| "semver"
	| "uuid"
	| ((model: SubModel, value: SubModel) => boolean);

type EnumType = string[];

export type SurrealRecord<SubModel extends Model = Model> = new (props?: ITable<Model>) => SubModel;

export function Field<SubModel extends Model = Model<any>, Key = string | symbol>(props?: ITableFieldProps<SubModel>) {
	return function (target: SubModel, propertyKey: Key, descriptor?: PropertyDescriptor) {
		const name = target.__tableName(true);
		const existingMetadata = Lucid.get(name);
		const updatedMetadata = {
			...existingMetadata,
			fields: {
				...existingMetadata?.fields,
				[propertyKey as string]: {
					...(existingMetadata?.fields?.[propertyKey as string] || {}),
					from: propertyKey,
					to: props?.name,
					props: props,
				},
			},
		} as LucidMetadata<SubModel>;

		Lucid.set(name, updatedMetadata as LucidMetadata<Model<any>>);
	};
}

export function FieldRelation<
	Rel extends Constructor<Model<true>>,
	IN extends Constructor<Model>,
	OUT extends Constructor<Model>,
	SubModel extends Model = Model,
	Key = string | symbol,
>(props: IFieldRelationProps<Rel, IN, OUT>) {
	return function (target: SubModel, propertyKey: Key) {
		const name = target.__tableName(true);
		const direction = props.in ? "IN" : "OUT";
		const existingMetadata = Lucid.get(name);
		const tableOf = FieldsType[name]?.fields;

		const updatedMetadata = {
			...existingMetadata,
			fields: {
				...existingMetadata?.fields,
				[propertyKey as string]: {
					...(existingMetadata?.fields?.[propertyKey as string] || {}),
					from: propertyKey,
					to: undefined,
					props: props,
					relation: {
						from: target,
						via: props.model,
						to: props.in || props.out,
						direction: direction,
					},
					...tableOf?.[propertyKey as string],
				},
			},
		} as LucidMetadata<SubModel>;

		Lucid.set(name, updatedMetadata as LucidMetadata<Model<any>>);
	};
}
