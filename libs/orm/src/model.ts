import {
	SurrealEvent,
	SurrealEventManager,
	TSurrealDataType,
	TSurrealEventProps,
} from './';

import { 
	SelectBuilder, 
	TSelectExpression, 
	UpdateBuilder, 
	DeleteBuilder
} from './builders';

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

	public static create<SubModel extends Model>(
		this: { new (props?: ITable<Model>): SubModel; }, 
		args: Partial<{ [P in keyof SubModel]: SubModel[P]}>
	) {}

	public static select<SubModel extends Model>(
		this: { new (props?: ITable<Model>): SubModel },
		fields: TSelectExpression<SubModel> = '*',
	) {
		return new SelectBuilder<SubModel>({ query_from: new this().getTableName() })
			.select(fields);
	}

	public static update<SubModel extends Model>(
		this: { new (props?: ITable<Model>): SubModel },
		from?: string
	) {
		return new UpdateBuilder<SubModel>({ query_from: from || new this().getTableName() });
	}

	public static delete<SubModel extends Model>(
		this: { new (props?: ITable<Model>): SubModel },
		from?: string
	) {
		return new DeleteBuilder<SubModel>({ query_from: from || new this().getTableName() });
	}

	public static events<SubModel extends Model>(
		this: { new (props?: ITable<Model>): SubModel },
		args: TSurrealEventProps<SubModel>[],
	) {
		const model = new this();

		return new SurrealEventManager(model, args);
	}
	
	public async save(): Promise<boolean> {
		// try {
		// 	//await db.create(this.getTableName(), {});
		// } catch (error) {
		// 	return false;
		// }

		return true;
	}
}