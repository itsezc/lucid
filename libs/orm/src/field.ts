import { Constructor } from 'type-fest';
import Lucid, { IFieldRelationProps, ITable, ITableFieldProps } from './lucid';
import { Model } from './model';
import 'reflect-metadata';

export type TSurrealFieldIndex = 'unique' | boolean;

export type TSurrealDataType =
	| 'string'
	| 'enum'
	| 'bool'
	| 'int'
	| 'float'
	| 'decimal'
	| 'datetime'
	| 'object'
	| 'polygon'
	| 'point'
	| 'line'
	| 'multipoint'
	| 'multiline'
	| 'multipolygon'
	| 'collection'
	| 'array'
	| 'future'
	| 'record';

export type TSurrealDataTypePrimitive = Omit<TSurrealDataType, 'future'>;

export type TAssertHandler<SubModel> =
	| 'alpha'
	| 'alphanum'
	| 'ascii'
	| 'domain'
	| 'email'
	| 'hexadecimal'
	| 'latitude'
	| 'longitude'
	| 'numeric'
	| 'semver'
	| 'uuid'
	| ((model: SubModel, value: SubModel) => boolean);

type EnumType = string[];

export type SurrealRecord<SubModel extends Model = Model> = new (props?: ITable<Model>) => SubModel;

export function Field<SubModel extends Model = Model, Key = string | symbol>(props?: ITableFieldProps<SubModel>) {
	return function (target: SubModel, propertyKey: Key) {
		if (props?.name) {
			const name = target.__tableName(true);
			const existingMetadata = Lucid.get(name);
			Lucid.set(name, {
				...existingMetadata,
				fields: {
					...existingMetadata?.fields,
					[propertyKey.toString()]: {
						...(existingMetadata?.fields?.[propertyKey.toString()] || {}),
						from: propertyKey.toString(),
						to: props?.name,
						props: props,
					},
				},
			});
		}
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
		const direction = props.in ? 'IN' : 'OUT';
		const existingMetadata = Lucid.get(name);
		Lucid.set(name, {
			...existingMetadata,
			fields: {
				...existingMetadata?.fields,
				[propertyKey.toString()]: {
					...(existingMetadata?.fields?.[propertyKey.toString()] || {}),
					from: propertyKey.toString(),
					to: undefined,
					props: props,
					relation: {
						from: target,
						via: props.model,
						to: props.in || props.out,
						direction: direction,
					},
				},
			},
		});
	};
}
