import type { ITable } from './table';
import { Field, Lucid } from './';
import { SurrealEventManager, TSurrealEventProps } from './event';
import { SelectBuilder, TSelectExpression, UpdateBuilder, DeleteBuilder } from './builders';
import { stringifyToSQL, toSnakeCase } from './util';
import { SubsetModel, PartialId } from './builders/types';
import { InsertableBuilder, IBuilderProps } from './builders/builder';

export interface IBasicModel {
	id: string;
}

export interface IModel extends IBasicModel {
	__tableName(original?: boolean): string;
	// __modelName: string;
}

export class ModelWriter<T extends IModel> extends InsertableBuilder<T> {
	private isSetting = false;
	constructor(protected props: IBuilderProps<T>) {
		super(props);
	}

	public set<K extends keyof SubsetModel<T>, Data extends SubsetModel<T>[K], I = { [P in K]: Data }>(field: K, data: Data): this & I {
		this.model[field as K as string] = this.transformModel(data);
		this.isSetting = true;
		return super.set(field, data) as unknown as this & I;
	}

	public async save<Reqs extends PartialId<SubsetModel<T>>>(this: ModelWriter<T> & Reqs): Promise<T> {
		let row = {
			...this.props.model,
			schemafull: undefined,
			edge: undefined,
			insideSet: undefined,
		};

		// rome-ignore lint/performance/noDelete: Surreal expects empty properties not undefined
		Object.keys(row).forEach((key) => row[key] === undefined && delete row[key]);
		row = this.transformModel(row);
		if (this.props.model.id) {
			// @ts-ignore
			this.props.model.constructor.update(`${this.props.model.__tableName()}:${this.id}`).merge(row).execute();
		} else {
			let query = `CREATE ${this.props.model.__tableName()}`;
			if (this.isSetting) {
				// return as SET property = value in all object
				let set = '';
				Object.keys(row).forEach((key) => {
					set += `${key} = ${stringifyToSQL(row[key])}, `;
				});
				set = set.slice(0, -2);
				query = query.concat(' SET ', set, ';');
			} else {
				query = query.concat(' CONTENT ', stringifyToSQL(row), ';');
			}

			console.log(query);
			const response = await Lucid.client().query<T[]>(query);
			//todo: handle errors in a more elegant way perhaps a custom error class

			if (response.length === 0) {
				throw new Error('No response from server');
			}

			if (response[0].status !== 'OK') {
				throw new Error(response[0].status);
			}

			Object.assign(this.model, response[0].result[0]);
		}

		return this.model as unknown as T;
	}
}

export class Model implements IModel {
	protected schemafull = true;
	protected edge = false;

	// @Field()
	// public __modelName!: string;
	public id!: string;

	constructor(props?: ITable<Model>) {
		const tableMeta = Lucid.get(this.constructor.name);
		if (tableMeta) {
			this.edge = props?.edge ?? Lucid.get(this.constructor.name)?.edge ?? false;
		}
	}

	public __tableName(original = false) {
		return original ? this.constructor.name : toSnakeCase(Lucid.get(this.constructor.name).name || this.constructor.name);
	}

	public static select<SubModel extends IModel, T extends keyof SubsetModel<SubModel>>(
		this: { new (props?: ITable<Model>): SubModel },
		fields: TSelectExpression<SubModel, T, null> = '*',
	) {
		return new SelectBuilder<SubModel, Pick<SubModel, T>>({ model: new this({ name: Lucid.get(this.name), edge: true }) }).select(fields);
	}

	public static update<SubModel extends Model, From extends `${string}:${string}`>(this: { new (props?: ITable<Model>): SubModel }, from?: From) {
		return new UpdateBuilder<SubModel>({ model: new this() }).from(from);
	}

	public static delete<SubModel extends Model, From extends `${string}:${string}`>(this: { new (props?: ITable<Model>): SubModel }, from?: From) {
		return new DeleteBuilder<SubModel>({ model: new this() }).from(from);
	}

	public static events<SubModel extends Model>(this: { new (props?: ITable<Model>): SubModel }, args: TSurrealEventProps<SubModel>[]) {
		return new SurrealEventManager(new this(), args);
	}

	public static async create<SubModel extends Model>(this: { new (props?: ITable<Model>): SubModel }, props: PartialId<SubsetModel<SubModel>>) {
		const model = new this();
		Object.assign(model, props);
		const writer = new ModelWriter<SubModel>({ model: model });
		return await (writer as typeof writer & SubModel).save();
	}

	public static async createMany<SubModel extends Model>(
		this: { new (props?: ITable<Model>): SubModel },
		props: PartialId<SubsetModel<SubModel>>[],
	): Promise<SubModel[]> {
		const staticModel = this as unknown as typeof Model;
		return await Promise.all(props.map((prop) => staticModel.create(prop)) as Promise<SubModel>[]);
	}

	public static set<SubModel extends Model, K extends keyof SubsetModel<SubModel>, Data extends SubsetModel<SubModel>[K]>(
		this: { new (props?: ITable<Model>): SubModel },
		field: K,
		data: Data,
	) {
		return new ModelWriter<SubModel>({ model: new this() }).set(field, data);
	}
}
