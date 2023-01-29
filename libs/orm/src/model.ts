import {
	SurrealEventManager,
	TSurrealEventProps,
	Lucid
} from './';

import { 
	SelectBuilder, 
	TSelectExpression, 
	UpdateBuilder, 
	DeleteBuilder
} from './builders';

import type { ITable } from './table';
import { stringifyToSQL, toSnakeCase } from './util';

export class Model {
	protected schemafull = true;
	protected edge = false;

	public id!: string;

	constructor(props?: ITable<Model>) {
		if (props) {
			this.edge = props.edge ?? false;
		}
	}

	public __tableName() {
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
		return new SelectBuilder<SubModel>({ query_from: new this().__tableName() })
			.select(fields);
	}

	public static update<SubModel extends Model>(
		this: { new (props?: ITable<Model>): SubModel },
		from?: string
	) {
		return new UpdateBuilder<SubModel>({ query_from: from || new this().__tableName() });
	}

	public static delete<SubModel extends Model>(
		this: { new (props?: ITable<Model>): SubModel },
		from?: string
	) {
		return new DeleteBuilder<SubModel>({ query_from: from || new this().__tableName() });
	}

	public static events<SubModel extends Model>(
		this: { new (props?: ITable<Model>): SubModel },
		args: TSurrealEventProps<SubModel>[],
	) {
		const model = new this();

		return new SurrealEventManager(model, args);
	}
	
	public async save() {
		const row = {
			...this,
			schemafull: undefined,
			edge: undefined,
		};

		// rome-ignore lint/performance/noDelete: Surreal expects empty properties not undefined
		Object.keys(row).forEach(key => row[key] === undefined && delete row[key]);
		
		if (this.id) {
			// @ts-ignore
			this.constructor.update(`${this.__tableName()}:${this.id}`)
				.merge(row)
				.execute();
		} else {
			let query = `CREATE ${this.__tableName()}`;
			query = query.concat(' CONTENT ', stringifyToSQL(row), ';');

			console.log(await Lucid.client().query(query));
		}

		return this;
	}
}