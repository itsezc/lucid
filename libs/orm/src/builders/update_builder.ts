import { TDIFF, TTimeout } from '../internal';
import { Model } from '../model';
import { ISQLBuilderProps } from '../sql_builder';
import { TSubModelWhere, WhereToSQL } from '../where';

export class UpdateBuilder<SubModel extends Model> {
	private query_where: string;

	private query_table: string;

	private query_timeout: TTimeout;
	private query_return: TDIFF = 'NONE';

	private query_parallel = false;

	constructor(props: ISQLBuilderProps<SubModel>) {
		this.query_table = props.from_table;
	}

	public where(condition: string | TSubModelWhere<SubModel>) {
		if (typeof condition === 'string') this.query_where = condition;
		else this.query_where = WhereToSQL(condition);

		return this;
	}

	public timeout(timeout: TTimeout) {
		this.query_timeout = timeout;
		return this;
	}

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

	public parallel() {
		this.query_parallel = true;
		return this;
	}
}