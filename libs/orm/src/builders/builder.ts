import { IModel } from '../model';
import { TSubModelWhere, WhereToSQL } from '../operations/where';
import { TDIFF, TTimeout } from '../internal';
import Lucid from '../lucid';

export interface IBuilderProps<SubModel extends IModel> {
	model: SubModel;
	query_from?: string;
}

export interface IBuilder<SubModel extends IModel> {
	build(): string;
	execute(): SubModel | SubModel[];
}

export type TMappedModelProperty<T extends IModel> = { [P in keyof T]: T[keyof T] };

export class Builder<SubModel extends IModel> {
	protected model: SubModel;
	protected query_from?: string;
	protected query_where?: string;
	protected query_timeout?: TTimeout;
	protected query_parallel = false;

	constructor(props: IBuilderProps<SubModel>) {
		this.model = props.model;
		this.query_from = props?.query_from;
		this.query_from = Lucid.tableMetadata.get(this.model.__tableName(true)).name || this.model.__tableName();
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
	protected query_return: TDIFF = 'NONE';

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
