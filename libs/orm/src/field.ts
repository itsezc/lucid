import Lucid from './lucid';
import { Model } from './model';
import { TPermissions } from './permissions';
import { ITable } from './table';

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

export type SurrealRecord<SubModel extends Model = Model> = new (
	props?: ITable<Model>,
) => SubModel;

interface ITableFieldProps<SubModel extends Model> {
	name?: string;
	index?: TSurrealFieldIndex;
	flexible?: boolean;
	assert?: TAssertHandler<SubModel>;
	permissions?: TPermissions<SubModel>;
}

export function Field<
	SubModel extends Model = Model,
	Key = string | symbol
>(props?: ITableFieldProps<SubModel>) {
	return function (target: SubModel, propertyKey: Key) 
	{
		if (props?.name) 
		{
			const name = target.__tableName(true);
			const existingMetadata = Lucid.tableMetadata.get(name);

			Lucid.tableMetadata.set(
				name, 
				{
					...existingMetadata,
					fields: [
						...(existingMetadata ? existingMetadata.fields : []),
						{
							from: propertyKey.toString(),
							to: props?.name,
						}
					]
				}
			);
		}
	};
}
