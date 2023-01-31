import { Model } from '..';
import { joinRangeFields } from '../util';
import { Builder, IBuilderProps, TMappedModelProperty } from './builder';

import { Lucid } from '../lucid';

type TComparisonOperator = '<'| '<=' | '=' | '>' | '>=';

export type TSelectExpression<SubModel extends Model> =
	'*' 
	| (keyof SubModel)[] 
	| TSelectExpressionAlias<SubModel>
	| TSelectExpressionAlias<SubModel>[]
	| ['*', TSelectExpressionAlias<SubModel>]
	| ['*', TSelectExpressionAlias<SubModel>][];

type TSelectExpressionAlias<T extends Model> = { 
	$?: [keyof T, TComparisonOperator, T[keyof T]] | keyof T,
	$$?: string | { [P in keyof T]?: T[keyof T] },
	as?: string,
	where?: string
};

export class SelectBuilder<SubModel extends Model>
	extends Builder<SubModel>
{
	private select_fields = '*';
	
	private query_range?: string;

	private subquery?: string[];
	private count_condition?: string;

	private query_select_fields: string[] = [];
	private query_select_fields_projections?: string[];

	private query_split?: string;

	private query_orderByRand = false;
	private query_orderBy?: [
		string, 
		'ASC' | 'DESC', 
		'COLLATE' | 'NUMERIC' | undefined
	][];

	private query_fetch_fields?: string[];

	private query_groupBy = false;
	private query_groupByFields?: (keyof SubModel)[];

	private query_limit?: number;
	private query_start?: number;

	constructor(props: IBuilderProps<SubModel>) {
		super(props);
	}

	public select(
		fields: TSelectExpression<SubModel>
	): SelectBuilder<SubModel> {
		// If fields are fields of table
		if(Array.isArray(fields)) this.select_fields = fields.join(', ');
		
		return this;
	}

	public range(range: string[][] | number[]): SelectBuilder<SubModel> {
		this.query_range = joinRangeFields(range);
		return this;
	}

	public count<T extends Model>(
		condition: string | SelectBuilder<T>,
		operator: TComparisonOperator,
		value: number
	): SelectBuilder<SubModel> {
		if (typeof condition === 'string') this.count_condition = condition;
		else this.count_condition = `${condition.build()} ${operator} ${value}`;

		return this;
	}

	public in(model: typeof Model | string): SelectBuilder<SubModel> {
		if (typeof model === 'string') this.subquery?.push(model);
		else this.subquery?.push(`->${new model().__tableName()}`);

		return this;
	}

	public of(model: typeof Model | string): SelectBuilder<SubModel> {
		if (typeof model === 'string') this.subquery?.push(model);
		else this.subquery?.push(`<-${new model().__tableName()}`);

		return this;
	}

	public orderBy(
		key: keyof SubModel, 
		order: 'ASC' | 'DESC', 
		extra?: 'COLLATE' | 'NUMERIC'
	): SelectBuilder<SubModel> {
		this.query_orderBy?.push([key.toString(), order, extra]);
		return this;
	}

	// ORDER BY RAND()
	public orderRandomly(): SelectBuilder<SubModel> {
		this.query_orderByRand = true;
		this.query_orderBy = [];
		return this;
	}

	/**
	 * SurrealDB supports data aggregation and grouping, with support for multiple fields, nested fields, and aggregate functions. In SurrealDB, every field which appears in the field projections of the select statement (and which is not an aggregate function), must also be present in the `GROUP BY` clause.
	 */
	public groupBy(fields?: (keyof SubModel)[]): SelectBuilder<SubModel> {
		if (fields) this.query_groupByFields = fields;
		this.query_groupBy = true;
		return this;
	}

	/**
	 * As SurrealDB supports arrays and nested fields within arrays, it is possible to split the result on a specific field name, returning each value in an array as a separate value, along with the record content itself. This is useful in data analysis contexts.
	 */
	public split(field: keyof SubModel): SelectBuilder<SubModel> {
		this.query_split = field.toString();
		return this;
	}

	/**
	 * To limit the number of records returned, using the `LIMIT` clause.
	 *	@param limit - Records limit
	 */
	public limit(limit: number): SelectBuilder<SubModel> {
		this.query_limit = limit;
		return this;
	}

	public start(start: number): SelectBuilder<SubModel> {
		this.query_start = start
		return this;
	}

	public fetch(fields: (keyof SubModel)[]): SelectBuilder<SubModel> {
		this.query_fetch_fields = fields.map(field => field.toString());
		return this;
	}

	public build(): string {
		let query = 'SELECT';


		if (this.subquery && this.query_from) query = query.concat(' ', this.subquery.join(''), '->', this.query_from);
		else query = query.concat(' ', this.select_fields);

		if (this.query_from) query = query.concat(' ', 'FROM ', this.query_from);

		if (this.query_range) query = query.concat(':', this.query_range);
	
		if (this.query_where) query = query.concat(' ', 'WHERE ', this.query_where);

		if (this.query_split) query = query.concat(' ', 'SPLIT ', this.query_split);
		if (this.query_fetch_fields) query = query.concat(' ', this.query_fetch_fields.join(', '));

		// @todo - OrderBy calculation
		if (this.query_orderBy) query = query.concat();
		if (this.query_orderByRand) query = query.concat(' ', 'ORDER BY RAND()');

		// @todo - GroupBy calculation
		if (this.query_groupByFields) query = query.concat(' ', 'GROUP BY ', this.query_groupByFields.join(', '));

		if (this.query_groupBy && this.query_select_fields_projections) query = query.concat(' ', 'GROUP BY ', this.query_select_fields_projections.join(', '));

		if (this.query_limit) query = query.concat(' ', 'LIMIT ', this.query_limit.toString());
		if (this.query_start) query = query.concat(' ', 'START ', this.query_start.toString());
		if (this.query_timeout) query = query.concat(' ', 'TIMEOUT ', this.query_timeout);
		if (this.query_parallel) query = query.concat(' ', 'PARALLEL');

		query += ';';

		return query;
	}

	public async execute(): Promise<SubModel[]> {
		return await Lucid.client()?.query(this.build()) as SubModel[];
	}

	public live() {}
}