import { SurrealEvent, SurrealEventManager, TSurrealEventProps } from "./event.js";
import { TSelectExpression, UpdateBuilder, DeleteBuilder } from "./builders/index.js";
import { stringifyToSQL, toSnakeCase } from "./util.js";
import { SubsetModel, PartialId, SubsetModelOrBasic, ToBasicModel } from "./builders/types.js";
import { InsertableBuilder, IBuilderProps } from "./builders/builder.js";
import { SelectBuilder } from "./builders/select/select_builder.js";
import { deepCopyProperties } from "./utilities/object-helpers.js";
import Lucid, { ITable } from "./lucid.js";

export interface IBasicModel {
	id: string;
}
export interface IModel extends IBasicModel {
	__tableName(original?: boolean): string;
}

export type UnselectedProperties<SubModel extends IBasicModel, T> = {
	[P in keyof SubModel as P extends T ? never : P]: SubModel[P];
};

export type AllowedProperties<SubModel extends IModel, T> = T | keyof UnselectedProperties<SubModel, T>;

export class ModelWriter<T extends IModel> extends InsertableBuilder<T> {
	private isSetting = false;
	private models: [T, string | null][] | undefined;
	constructor(protected props: IBuilderProps<T>) {
		super(props);
	}

	public set<K extends keyof SubsetModel<T>, Data extends SubsetModel<T>[K], I = { [P in K]: Data }>(field: K, data: Data): this & I {
		this.model[field as K] = this.transformModel(data);
		this.isSetting = true;
		return super.set(field, data) as unknown as this & I;
	}

	#createQuery<SubsetModel extends T>(model: SubsetModel): string {
		let row = {
			...model,
			schemafull: undefined,
			edge: undefined,
			insideSet: undefined,
		};

		row = this.transformModel(row);
		let query = `CREATE ${model.__tableName()}`;
		if (this.isSetting) {
			let set = "";
			Object.keys(row).forEach((key) => {
				set += `${key} = ${stringifyToSQL(row[key as keyof typeof row])}, `;
			});
			set = set.slice(0, -2);
			query = query.concat(" SET ", set, ";");
		} else {
			query = query.concat(" CONTENT ", stringifyToSQL(row), ";");
		}
		return query;
	}

	#insertQuery<SubsetModel extends T>(model: SubsetModel): string {
		const columns = Object.keys(model).join(", ");
		const values = Object.values(model)
			.map((value) => stringifyToSQL(value))
			.join(", ");
		return `INSERT INTO ${model.__tableName()} (${columns}) VALUES (${values});`;
	}

	#addModelAndQuery<SubModel extends T>(model: SubModel, isInsert = false): void {
		const query = isInsert ? this.#insertQuery(model) : this.#createQuery(model);
		if (!this.models) {
			this.models = [[model, query]];
		} else {
			this.models.push([model, query]);
		}
	}

	public create<SubModel extends T>(props: PartialId<SubsetModelOrBasic<SubModel>>): ModelWriter<T> & SubModel {
		const model = new (this.props.model.constructor as new (props?: ITable<SubModel>) => SubModel)();
		deepCopyProperties(model, props);
		this.#addModelAndQuery(model);
		return this as unknown as ModelWriter<T> & SubModel;
	}

	public insert<SubModel extends T>(props: PartialId<SubsetModelOrBasic<SubModel>>): ModelWriter<T> & SubModel {
		const model = new (this.props.model.constructor as new (props?: ITable<SubModel>) => SubModel)();
		deepCopyProperties(model, props);
		this.#addModelAndQuery(model);
		return this as unknown as ModelWriter<T> & SubModel;
	}

	public insertMany<SubModel extends T>(props: PartialId<SubsetModelOrBasic<SubModel>>[]): ModelWriter<T> & SubModel {
		const model = new (this.props.model.constructor as new (props?: ITable<SubModel>) => SubModel)();

		// do not include schemafull, edge, insideSet in columns
		const columnItems: string[] = [];
		Object.keys(model).forEach((key) => {
			if (key !== "schemafull" && key !== "edge" && key !== "insideSet") columnItems.push(key);
		});

		const columns = columnItems.join(", ");

		const models: SubModel[] = [];
		const values = props.map((prop) => {
			const model = new (this.props.model.constructor as new (props?: ITable<SubModel>) => SubModel)();
			prop = this.transformModel(prop, false);
			deepCopyProperties(model, prop);
			models.push(model);

			return `(${Object.values(prop)
				.map((value) => stringifyToSQL(value))
				.join(", ")})`;
		});

		const query = `INSERT INTO ${model.__tableName()} (${columns}) VALUES ${values.join(", ")};`;
		this.models = models.map((m, i) => [m, i === 0 ? query : null]);

		return this as unknown as ModelWriter<T> & SubModel;
	}

	public async save<Fields extends PartialId<SubsetModel<T>>, Many extends boolean>(this: ModelWriter<T> & Fields, many?: Many): Promise<Many extends true ? T[] : T> {
		let query = "BEGIN TRANSACTION;\n";
		query +=
			this.models
				?.filter(([_, q]) => q !== null)
				.map(([_, q]) => q)
				.join("\n") || this.#createQuery(this.props.model);
		query += "\nCOMMIT TRANSACTION;";

		const response = await Lucid.client().query<T[]>(query);
		if (response.length === 0) {
			throw new Error("No response from server");
		}
		if (response[0]?.status !== "OK") {
			throw new Error(response[0]?.status);
		}

		if (this.models) {
			this.models.forEach(([m, q], i) => {
				deepCopyProperties(m, response[0].result[i]);
			});

			if (!many) {
				return this.models[0][0] as unknown as Many extends true ? T[] : T;
			}

			return this.models.map(([m, q]) => m) as unknown as Many extends true ? T[] : T;
		}

		deepCopyProperties(this.model, response[0].result[0]);
		return this.model as unknown as Many extends true ? T[] : T;
	}
}

export class Model<Edge extends boolean = boolean> implements IModel {
	protected schemafull = true;
	protected edge?: Edge;
	public id!: string;

	constructor(props?: ITable<Model>) {
		const tableMeta = Lucid.get(this.constructor.name);
	}

	public __tableName(original = false) {
		return original ? this.constructor.name : toSnakeCase(Lucid.get(this.constructor.name)?.table.name || this.constructor.name);
	}

	public static select<SubModel extends IModel, Alias extends string, F extends TSelectExpression<SubsetModel<SubModel>, Alias> = "*">(
		this: { new (props?: ITable<Model>): SubModel },
		fields: F,
	) {
		return new SelectBuilder<SubModel, Pick<SubsetModel<SubModel>, F extends "*" ? keyof SubsetModel<SubModel> : F[number] & keyof SubsetModel<SubModel>>>({
			model: new this({ name: Lucid.get(this.name)?.table.name || "", edge: true }),
		}).select(fields ?? "*");
	}

	public static count<SubModel extends IModel, T extends keyof SubsetModel<SubModel> | "*">(this: { new (props?: ITable<Model>): SubModel }, field: T) {
		return new SelectBuilder<SubModel, Pick<SubModel, T extends "*" ? keyof SubsetModel<SubModel> : T>>({ model: new this() }).count(field);
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

	public static async create<SubModel extends Model>(this: { new (props?: ITable<Model>): SubModel }, props: PartialId<SubsetModelOrBasic<SubModel>>) {
		return new ModelWriter<SubModel>({ model: new this() }).create(props).save(false);
	}

	public static async createMany<SubModel extends Model>(this: { new (props?: ITable<Model>): SubModel }, props: PartialId<SubsetModelOrBasic<SubModel>>[]): Promise<SubModel[]> {
		const writer = new ModelWriter<SubModel>({ model: new this() });
		for (const prop of props) {
			writer.create(prop as any);
		}
		return await (writer as any).save(true);
	}

	public static async insertMany<SubModel extends Model>(this: { new (props?: ITable<Model>): SubModel }, props: PartialId<SubsetModelOrBasic<SubModel>>[]) {
		return new ModelWriter<SubModel>({ model: new this() }).insertMany(props).save(true);
	}

	public static async insert<SubModel extends Model>(this: { new (props?: ITable<Model>): SubModel }, props: PartialId<SubsetModelOrBasic<SubModel>>) {
		return new ModelWriter<SubModel>({ model: new this() }).insert(props).save(false);
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
	// @Field({name: "in"})
	public inside!: Inside;

	// @Field({name: "out"})
	public outside!: Outside;
}
