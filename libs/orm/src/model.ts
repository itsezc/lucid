import {
	SurrealEvent,
	SurrealEventManager,
	TQueryArgs,
	TSurrealDataType,
	TSurrealEventProps,
} from './';
import { SQLBuilder } from './sql_builder';
import type { ITable } from './table';
import { toSnakeCase } from './util';

type TSurrealTablePropertiesField = {
	field: string;
	type: TSurrealDataType;
	permissions?: string;
	index?: boolean | 'unique';
};

interface ISurrealTableProperties {
	permissions?: string;
	fields?: TSurrealTablePropertiesField[];
}

export type TModelProperties<SubModel extends Model> = Omit<
	SubModel,
	'save' | 'getTableName'
>;

export class Model {
	protected schemafull = true;
	protected edge = false;

	public id!: string;

	constructor(protected props?: ITable<Model>) {
		if (props) {
			this.edge = props.edge ?? false;
		}
	}

	public getTableName() {
		return toSnakeCase(this.constructor.name);
	}

	// @todo
	public static async find() {
		return this;
	}

	// public static create<SubModel extends Model>(this: {
	// 	new (props?: ITable<Model>): SubModel;
	// }) {
	// 	return new SQLBuilder();
	// }

	public static query<SubModel extends Model>(
		this: { new (props?: ITable<Model>): SubModel },
		args?: TQueryArgs<SubModel>,
	) {
		const model = new this();

		return new SQLBuilder<SubModel>({
			from_table: model.getTableName(),
			args,
		});
	}

	public static events<SubModel extends Model>(
		this: { new (props?: ITable<Model>): SubModel },
		args: TSurrealEventProps<SubModel>[],
	) {
		const model = new this();

		return new SurrealEventManager(model, args);
	}

	// @todo
	public static async findOne(x: TModelProperties<Model>): Promise<false> {
		return false;
	}

	public async save(): Promise<boolean> {
		try {
			//await db.create(this.getTableName(), {});
		} catch (error) {
			return false;
		}

		return true;
	}
}