import { Model } from "./model";
import { TPermissions } from "./permissions";
import { ITable } from "./table";

type TIndex = "unique" | boolean;

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

type TAssertHandler<SubModel> = (model: SubModel, value: SubModel) => boolean;

type EnumType = string[];

export type SurrealRecord<SubModel extends Model> = new (
	props?: ITable<Model>,
) => SubModel;

interface ITableFieldProps<
	SubModel extends Model,
	Descriptor,
	RecordModel extends Model = Model,
> {
	name?: string;
	type?: TSurrealDataType;
	array?: TSurrealDataTypePrimitive | SurrealRecord<SubModel>;
	record?: SurrealRecord<RecordModel>;
	enum?: EnumType;
	index?: TIndex;
	default?: Descriptor;
	assert?: TAssertHandler<SubModel>;
	permissions?: TPermissions<SubModel>;
}

export function Field<
	SubModel extends Model = Model,
	Key extends string | symbol = string | symbol,
	SurrealType extends TSurrealDataType = "string",
	Descriptor extends TypedPropertyDescriptor<SurrealType>["value"] = SurrealType,
>(props?: ITableFieldProps<SubModel, Descriptor>) {
	return function (target: SubModel, propertyKey: Key) {
		let value: ITableFieldProps<SubModel, Descriptor> | undefined = {
			type: "string",
			...props,
		};

		const getter = function () {
			return value;
		};

		const setter = function (newVal: ITableFieldProps<SubModel, Descriptor>) {
			value = newVal;
		};

		Object.defineProperty(target, propertyKey, {
			get: getter,
			set: setter,
		});
	};
}
