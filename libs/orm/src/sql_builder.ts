import { Model, SQL, TQueryArgs } from './';
import { joinFields } from './util';

interface ISQLBuilderProps<SubModel extends Model> {
	from_table: string;
	args?: TQueryArgs<SubModel>;
}

export class SQLBuilder<SubModel extends Model> {
	private from_table: string;
	private range: string;
	private select_fields = '';

	private subquery: string[] = [];
	private where_condition: string;
	private count_condition: string;

	private query_parallel = false;
	private query_orderBy: [string, 'ASC' | 'DESC'][] = [];

	constructor(props: ISQLBuilderProps<SubModel>) {
		this.from_table = props.from_table;
		this.range = joinFields(props.args?.range);
	}

	public select(fields: (keyof SubModel)[]): SQLBuilder<SubModel> {
		this.select_fields = fields.join(', ');
		return this;
	}

	public where(condition: string): SQLBuilder<SubModel> {
		if (typeof condition === 'string')
			this.where_condition = condition;
		
		return this;
	}

	public count<T extends Model>(
		condition: string | SQLBuilder<T>,
		operator: '<'| '<=' | '=' | '>' | '>=',
		value: number
	): SQLBuilder<SubModel> {
		if (typeof condition === 'string')
			this.count_condition = condition;
		else
			this.count_condition = `${condition.build()} ${operator} ${value}`;

		return this;
	}

	public in(model: typeof Model | string): SQLBuilder<SubModel> {
		if (typeof model === 'string') this.subquery.push(model);
		else this.subquery.push(`->${new model().getTableName()}`);

		return this;
	}

	public of(model: typeof Model | string): SQLBuilder<SubModel> {
		if (typeof model === 'string') this.subquery.push(model);
		else this.subquery.push(`<-${new model().getTableName()}`);

		return this;
	}

	public from(table: string): SQLBuilder<SubModel> {
		this.from_table = table;
		return this;
	}

	public orderBy(key: keyof SubModel, order: 'ASC' | 'DESC'): SQLBuilder<SubModel> {
		this.query_orderBy.push([key.toString(), order]);
		return this;
	}

	public parallel(): SQLBuilder<SubModel> {
		this.query_parallel = true;
		return this;
	}

	// @todo FROM is optional i.e. 
	// `SELECT * FROM person WHERE ->knows->person->(knows WHERE influencer = true) TIMEOUT 5s;`
	public build() {
		const is_subquery = this.subquery.length > 0;
		const subquery = `${this.subquery.join('')}->${this.from_table}`;

		return `SELECT 
			${is_subquery ? '' : this.select_fields}${subquery} FROM 
			${this.from_table}${this.range ? `:${this.range}` : ''
		};`;
	}

	public execute() {}

	public live() {}
}
 