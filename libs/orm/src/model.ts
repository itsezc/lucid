import { Lucid } from './';
import { SurrealEventManager, TSurrealEventProps } from './event';

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

	public __tableName(original = false) {
		return original ? this.constructor.name 
			: toSnakeCase(this.constructor.name);
	}

	public static select<SubModel extends Model>(
		this: { new (props?: ITable<Model>): SubModel },
		fields: TSelectExpression<SubModel> = '*',
	) {
		return new SelectBuilder<SubModel>({ model: new this() })
			.select(fields);
	}

	public static update<SubModel extends Model>(
		this: { new (props?: ITable<Model>): SubModel },
		from?: string
	) {
		return new UpdateBuilder<SubModel>({ model: new this() })
			.from(from);
	}

	public static delete<SubModel extends Model>(
		this: { new (props?: ITable<Model>): SubModel },
		from?: string
	) {
		return new DeleteBuilder<SubModel>({ model: new this() })
			.from(from);
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