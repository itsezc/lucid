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

	private query_select_fields: string[] = [];

	private query_parallel = false;
	private query_split: string | null = null;

	private query_orderByRand = false;
	private query_orderBy: [
		string, 
		'ASC' | 'DESC', 
		'COLLATE' | 'NUMERIC' | undefined
	][] = [];

	private query_fetch_fields: string[] = [];

	private query_groupBy = false;

	private query_limit: number = null;
	private query_start: number = null;

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

	public orderBy(
		key: keyof SubModel, 
		order: 'ASC' | 'DESC', 
		extra?: 'COLLATE' | 'NUMERIC'
	): SQLBuilder<SubModel> {
		this.query_orderBy.push([key.toString(), order, extra]);
		return this;
	}

	// ORDER BY RAND()
	public orderRandomly(): SQLBuilder<SubModel> {
		this.query_orderByRand = true;
		this.query_orderBy = [];
		return this;
	}

	/**
	 * SurrealDB supports data aggregation and grouping, with support for multiple fields, nested fields, and aggregate functions. In SurrealDB, every field which appears in the field projections of the select statement (and which is not an aggregate function), must also be present in the `GROUP BY` clause.
	 */
	public groupBy(): SQLBuilder<SubModel> {
		this.query_groupBy = true;
		return this;
	}

	/**
	 * As SurrealDB supports arrays and nested fields within arrays, it is possible to split the result on a specific field name, returning each value in an array as a separate value, along with the record content itself. This is useful in data analysis contexts.
	 */
	public split(field: keyof SubModel): SQLBuilder<SubModel> {
		this.query_split = field.toString();
		return this;
	}

	public limit(limit: number): SQLBuilder<SubModel> {
		this.query_limit = limit;
		return this;
	}

	public start(start: number): SQLBuilder<SubModel> {
		this.query_start = start
		return this;
	}

	public parallel(): SQLBuilder<SubModel> {
		this.query_parallel = true;
		return this;
	}

	public fetch(fields: (keyof SubModel)[]): SQLBuilder<SubModel> {
		this.query_fetch_fields = fields.map(field => field.toString());
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
 