import { Constructor } from 'type-fest';
import Lucid from './lucid';
import { Model, IModel } from './model';
import { TPermissions } from './permissions';
import { ITable } from './table';
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

type TAssertHandler<SubModel> =
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

interface ITableFieldProps<SubModel extends Model> {
	name?: string;
	index?: TSurrealFieldIndex;
	flexible?: boolean;
	assert?: TAssertHandler<SubModel>;
	permissions?: TPermissions<SubModel>;
}

export function Field<SubModel extends Model = Model, Key = string | symbol>(props?: ITableFieldProps<SubModel>) {
	return function (target: SubModel, propertyKey: Key) {
		if (props?.name) {
			const name = target.__tableName(true);
			const existingMetadata = Lucid.get(name);

			Lucid.set(name, {
				...existingMetadata,
				fields: [
					...(existingMetadata ? existingMetadata.fields : []),
					{
						from: propertyKey.toString(),
						to: props?.name,
					},
				],
			});
		}
	};
}

type IFieldRelationProps<T extends Constructor<Model>> = {
	model: T;
	direction: 'IN' | 'OUT';
};

export function FieldRelation<Rel extends Constructor<Model>, SubModel extends Model = Model, Key = string | symbol>(props: IFieldRelationProps<Rel>) {
	return function (target: SubModel, propertyKey: Key) {
		const name = target.__tableName(true);
		// console.log(new props.model());
		// Reflect.defineProperty(target, propertyKey, {
		// 	enumerable: true,
		// 	configurable: true,
		// 	value: 'RELATIONAL_FIELD',
		// });
		const existingMetadata = Lucid.get(name);
		Lucid.set(name, {
			...existingMetadata,
			fields: [
				...(existingMetadata ? existingMetadata.fields : []),
				{
					from: propertyKey.toString(),
					direciton: props.direction,
				},
			],
		});
	};
}
