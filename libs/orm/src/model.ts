import { Field, ITable, Lucid } from './';
import { SurrealEventManager, TSurrealEventProps } from './event';
import { TSelectExpression, UpdateBuilder, DeleteBuilder } from './builders';
import { stringifyToSQL, toSnakeCase } from './util';
import { SubsetModel, PartialId } from './builders/types';
import { InsertableBuilder, IBuilderProps } from './builders/builder';
import { SelectBuilder, SelectBuilderAny, TSelectInput } from './builders/select_builder';

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
		this.model[field as K] = this.transformModel(data);
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
		Object.keys(row).forEach((key) => row[key as keyof typeof row] === undefined && delete row[key as keyof typeof row]);
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
					set += `${key} = ${stringifyToSQL(row[key as keyof typeof row])}, `;
				});
				set = set.slice(0, -2);
				query = query.concat(' SET ', set, ';');
			} else {
				query = query.concat(' CONTENT ', stringifyToSQL(row), ';');
			}

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

export type UnselectedProperties<SubModel extends IBasicModel, T> = {
	[P in keyof SubModel as P extends T ? never : P]: SubModel[P];
};

export type AllowedProperties<SubModel extends IModel, T> = T | keyof UnselectedProperties<SubModel, T>;

export class Model<Edge extends boolean = boolean> implements IModel {
	protected schemafull = true;
	protected edge?: Edge;

	// @Field()
	// public __modelName!: string;
	public id!: string;
	// private type?: Constructor<IModel>;
	// protected fields: LucidMetadata<this>;

	constructor(props?: ITable<Model>) {
		// this.type = Reflect.getPrototypeOf(this).constructor as Constructor<IModel>;
		// const tableMeta = Lucid.get(this.constructor.name);
		// if (tableMeta) {
		// 	this.edge = props?.edge ?? Lucid.get(this.constructor.name)?.table?.edge ?? false;
		// }
	}

	// export type TSelectExpression<SubModel extends IModel, T extends keyof SubModel | SelectBuilderAny, AS extends string> = '*' | T[];

	// public static select<SubModel extends IModel, T extends keyof UnselectedProperties<SubModel, T>>(
	// 		this: { new (props?: ITable<Model>): SubModel },
	// 		fields: TSelectExpression<SubModel, T, null> = '*',
	// 	) {
	// 		return new SelectBuilder<SubModel, Pick<SubModel, T>>({ model: new this({ name: Lucid.get(this.name).table.name, edge: true }) }).select(fields);
	// 	}

	public __tableName(original = false) {
		return original ? this.constructor.name : toSnakeCase(Lucid.get(this.constructor.name)?.table.name || this.constructor.name);
	}

	public static select<SubModel extends IModel, T extends TSelectInput<SubModel, Alias>, Alias extends string>(
		this: { new (props?: ITable<Model>): SubModel },
		fields: TSelectExpression<SubModel, T, Alias> = '*',
	) {
		return new SelectBuilder<SubModel, Pick<SubsetModel<SubModel>, T & keyof SubsetModel<SubModel>>>({
			model: new this({ name: Lucid.get(this.name)?.table.name || '', edge: true }),
		}).select(fields);
	}

	public static count<SubModel extends IModel, T extends keyof SubsetModel<SubModel> | '*'>(this: { new (props?: ITable<Model>): SubModel }, field: T) {
		return new SelectBuilder<SubModel, Pick<SubModel, T extends '*' ? keyof SubsetModel<SubModel> : T>>({ model: new this() }).count(field);
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

	public static async createMany<SubModel extends Model>(this: { new (props?: ITable<Model>): SubModel }, props: PartialId<SubsetModel<SubModel>>[]): Promise<SubModel[]> {
		const staticModel = this as unknown as typeof this & typeof Model;
		return await Promise.all(props.map((prop) => staticModel.create(prop)) as Promise<SubModel>[]);
	}

	public static set<SubModel extends Model, K extends keyof SubsetModel<SubModel>, Data extends SubsetModel<SubModel>[K]>(
		this: { new (props?: ITable<Model>): SubModel },
		field: K,
		data: Data,
	) {
		return new ModelWriter<SubModel>({ model: new this() }).set(field, data);
	}

	public static Empty<SubModel extends Model>(this: { new (props?: ITable<Model>): SubModel }) {
		return new this();
	}
}

export class EdgeModel<Inside extends Model = Model, Outside extends Model = Model> extends Model<true> {
	@Field({name: "in"})
	public inside!: Inside;

	@Field({name: "out"})
	public outside!: Outside;
}
