import { IModel, Model, IBasicModel } from '../model';
import { TSubModelWhere, WhereToSQL } from '../operations/where';
import { TDIFF, TTimeout } from '../internal';
import Lucid from '../lucid';
import { SubsetModel } from './types';
import { stringifyToSQL } from '../util';

export interface IBuilderProps<SubModel extends IModel> {
	model: SubModel;
	query_from?: string;
}

export interface IBuilder<SubModel extends IBasicModel> {
	build(): string;
	execute(): Promise<SubModel[]>;
}

export class Builder<SubModel extends IModel> {
	protected model: SubModel;
	protected query_from?: string;
	protected query_where?: string;
	protected query_timeout?: TTimeout;
	protected query_parallel = false;

	constructor(props: IBuilderProps<SubModel>) {
		this.model = props.model;
		this.query_from = props?.query_from;
		this.query_from = Lucid.get(this.model.__tableName(true)).name || this.model.__tableName();
	}

	public where(condition: string | TSubModelWhere<SubModel>) {
		if (typeof condition === 'string') this.query_where = condition;
		else this.query_where = WhereToSQL(this.model.__tableName(true), condition);

		return this;
	}

	public timeout(timeout: TTimeout) {
		this.query_timeout = timeout;
		return this;
	}

	public parallel() {
		this.query_parallel = true;
		return this;
	}

	public from(record?: string) {
		if (record) this.query_from = record;
		return this;
	}
}

export class ReturnableBuilder<SubModel extends IModel> extends Builder<SubModel> {
	protected query_return: TDIFF = 'AFTER';

	public returnDiff() {
		this.query_return = 'DIFF';
		return this;
	}

	public returnBefore() {
		this.query_return = 'BEFORE';
		return this;
	}

	public returnAfter() {
		this.query_return = 'AFTER';
		return this;
	}
}

type AppendOperator = '=' | '+=' | '-=';
export class InsertableBuilder<SubModel extends IModel> extends ReturnableBuilder<SubModel> {
	protected query_set?: string;

	public transformModel<Data>(row: Data) {
		if (typeof row !== 'object') return row;
		if (row instanceof Model) return row.id;
		if (row instanceof Array) return row.map((item) => this.transformModel(item));

		// check for nested models, if found, transform them to their id
		Object.keys(row).forEach((key) => {
			if (row[key] instanceof Model) {
				console.log('ZE TRANSFORMER', row);
				if (!row[key].id) return;
				row[key] = row[key].id;
			}

			// recursively transform nested models
			if (row[key] instanceof Array) {
				row[key] = row[key].map((item) => this.transformModel(item));
			}
			if (typeof row[key] === 'object') {
				row[key] = this.transformModel(row[key]);
			}
		});
		return row;
	}

	protected appendToQuerySet<Data>(field: string, data: Data, operation: AppendOperator) {
		if (data === undefined || data === null) return this as unknown as InsertableBuilder<SubModel>;
		if (this.query_set) this.query_set += ', ';
		else this.query_set = '';
		this.query_set += `${field} ${operation} ${stringifyToSQL(data)}`;
		return this;
	}

	public set<K extends keyof SubsetModel<SubModel>, Data extends SubsetModel<SubModel>[K]>(field: K, data: Data) {
		this.appendToQuerySet(field as string, this.transformModel(data), '=');
		return this;
	}
}
