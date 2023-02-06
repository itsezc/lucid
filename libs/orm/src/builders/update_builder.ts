import Lucid from '../lucid';
import { IModel, Model, IBasicModel } from '../model';
import { IBuilderProps, IBuilder, InsertableBuilder } from './builder';
import { SubsetModel, PartialId } from './types';
import { KeyOfArraysWithElement as OnlyArray, Simplify } from '../utilities/helper.types';
import { stringifyToSQL } from '../util';

export class UpdateBuilder<SubModel extends IBasicModel, Subset extends Partial<IBasicModel> = PartialId<SubsetModel<SubModel>>>
	extends InsertableBuilder<SubModel & IModel>
	implements IBuilder<SubModel>
{
	protected query_content?: Partial<SubModel>;
	protected records_to_update?: Partial<SubsetModel<Model>>[] = [];
	protected query_merge?: object;

	constructor(props: IBuilderProps<SubModel & IModel>) {
		super(props);
	}

	async execute(): Promise<SubModel[]> {
		const query = this.build();
		const response = await Lucid.client().query<SubModel[]>(query);
		return response[0].result;
	}

	public push<K extends keyof OnlyArray<Subset>, Data extends OnlyArray<Subset>[K]>(field: K, data: Data): this {
		this.appendToQuerySet(field as string, this.transformModel(data), '+=');
		return this;
	}

	public pop<K extends keyof OnlyArray<Subset>, Data extends OnlyArray<Subset>[K]>(field: K, data: Data): this {
		this.appendToQuerySet(field as string, this.transformModel(data), '-=');
		return this;
	}

	public content<T extends Subset>(fields: T): UpdateBuilder<Simplify<T & IBasicModel>> {
		this.query_content = fields as unknown as Partial<SubModel>;
		return this as unknown as UpdateBuilder<Simplify<T & IBasicModel>>;
	}

	public merge(fields: Partial<SubsetModel<SubModel>>): this {
		this.query_merge = fields as unknown as Partial<SubModel>;
		return this;
	}

	public build() {
		let query = `UPDATE ${this.query_from}`;

		if (this.query_set) query = query.concat(' ', 'SET ', this.query_set);

		if (this.query_merge) query = query.concat(' ', 'MERGE ', stringifyToSQL(this.query_merge));

		if (this.query_content) {
			// rome-ignore lint/performance/noDelete: Surreal expects empty properties not undefined
			Object.keys(this.query_content).forEach((key) => this.query_content[key] === undefined && delete this.query_content[key]);

			query = query.concat(' ', 'CONTENT ', stringifyToSQL(this.query_content));
		}

		if (this.query_where) query = query.concat(' ', 'WHERE ', this.query_where);
		if (this.query_return) query = query.concat(' ', 'RETURN ', this.query_return);
		if (this.query_timeout) query = query.concat(' ', 'TIMEOUT ', this.query_timeout);
		if (this.query_parallel) query = query.concat(' ', 'PARALLEL');

		query = query.concat(';');

		return query;
	}
}
