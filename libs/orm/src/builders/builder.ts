import { Model } from '../model';
import { TSubModelWhere, WhereToSQL } from '../operations/where';
import { TDIFF, TTimeout } from '../internal';

export interface IBuilderProps {
	query_from: string;
}

export interface IBuilder<SubModel extends Model> {
	build(): string;
	execute(): SubModel | SubModel[];
}

export type TMappedModelProperty<T extends Model> = { [P in keyof T]: T[keyof T] };

export class Builder<SubModel extends Model> {
	protected query_from: string;
	protected query_where: string;
	protected query_timeout: TTimeout;
	protected query_parallel = false;

	constructor(props: IBuilderProps) {
		this.query_from = props.query_from;
	}

	public where(condition: string | TSubModelWhere<SubModel>) {
		if (typeof condition === 'string') this.query_where = condition;
		else this.query_where = WhereToSQL(condition);
		
		return this;
	};

	public timeout(timeout: TTimeout) {
		this.query_timeout = timeout;
		return this;
	}

	public parallel() {
		this.query_parallel = true;
		return this;
	}
}

export class ReturnableBuilder<SubModel extends Model> 
	extends Builder<SubModel> 
{
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