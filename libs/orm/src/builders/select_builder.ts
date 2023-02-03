import { IModel, Model } from '..';
import { joinRangeFields } from '../util';
import { Builder, IBuilderProps } from './builder';
import { Lucid } from '../lucid';
import { Simplify, UnionToArray, RenameKey } from '../utilities/helper.types';
import { RequireAtLeastOne, SetOptional } from 'type-fest';

type TComparisonOperator = '<' | '<=' | '=' | '>' | '>=';

export type TSelectExpression<SubModel extends IModel, T extends keyof SubModel, AS extends string> =
	| '*'
	| T[]
	| TSelectExpressionAlias<SubModel, T, AS>
	| TSelectExpressionAlias<SubModel, T, AS>[]
	| ['*', TSelectExpressionAlias<SubModel, T, AS>]
	| ['*', TSelectExpressionAlias<SubModel, T, AS>][];

type TSelectExpressionAlias<SubModel extends IModel, T extends keyof SubModel, AS extends string> = {
	$?: [T, TComparisonOperator, SubModel[T]] | T;
	$$?: string | { [P in keyof SubModel]?: SubModel[keyof SubModel] };
	as?: AS;
	where?: string;
};

export type OnlyRecordProps<T extends IModel> = { [P in keyof T as T[P] extends IModel | IModel[] ? P : never]: T[P] };
export type BasicRecordProps<T extends IModel> = {
	[P in keyof T]: T[P] extends IModel ? string : T[P] extends IModel[] ? string[] : T[P];
} & IModel;

export type SubsetModel<M extends IModel> = { [P in keyof M as M[P] extends Function ? never : P]: M[P] } & { id: string };
export type PartialId<SubModel extends IModel> = SetOptional<SubsetModel<SubModel>, 'id'>;

export type MergeSelections<SubModel extends IModel, Selections, NewKeys extends keyof SubModel | keyof Selections> = Simplify<
	Pick<SubModel & BasicRecordProps<Selections & IModel>, NewKeys | keyof Selections>
>;

export type RenamePropForSelect<T, K extends keyof T, NewKey extends string> = NewKey extends null ? T : Simplify<Omit<T, K> & { [P in NewKey]: T[K] }>;

type FirstKey<T> = UnionToArray<keyof T> extends [infer U, ...unknown[]] ? U : never;
type AsType<T> = T extends SelectBuilder<Model, infer U> ? FirstKey<U> & string : T & string;

type CountParams<AS extends string, R extends string> =
	| RequireAtLeastOne<Simplify<{ [OP in TComparisonOperator]?: number } & { as?: AS; replace?: R }>>
	| boolean;

type CountResult<
	Selections,
	DefaultKey extends string,
	T extends CountParams<string, keyof Selections & string>,
	NewKey extends string = T extends { as: infer As } ? As & string : DefaultKey,
	NewValue = T extends { [OP in TComparisonOperator]?: number } ? boolean : number,
> = T extends { replace: infer U }
	? {
			[K in keyof Selections as K extends U ? NewKey : K]: K extends U ? NewValue : Selections[K];
	  }
	: Simplify<{ [K in NewKey]: NewValue } & Selections>;

export type SelectBuilderAny = SelectBuilder<Model, unknown>;

export class SelectBuilder<SubModel extends IModel, Selections> extends Builder<SubModel> {
	private select_fields = '*';

	private query_range?: string;

	private subquery?: string[] = [];
	private count_condition?: string;
	private count_operator?: [TComparisonOperator, number?, string?];

	private query_select_fields: string[] = [];
	private query_select_fields_projections?: string[];

	private query_split?: string;

	private query_orderByRand = false;
	private query_orderBy?: [string, 'ASC' | 'DESC', 'COLLATE' | 'NUMERIC' | undefined][];

	private query_fetch_fields?: string[] = [];

	private query_groupBy = false;
	private query_groupByFields?: (keyof SubModel)[];

	private query_limit?: number;
	private query_start?: number;

	constructor(props: IBuilderProps<SubModel>, selectFields?: string) {
		super(props);
		this.select_fields = selectFields || '';
	}

	#replaceExistingSelectedFields = (key: string) => {
		const regex2 = new RegExp(`(, \\w+ AS ${key}|, ${key}|${key}, )`, 'gm');
		this.select_fields = this.select_fields.replace(regex2, '');
	};

	public select<T extends keyof SubsetModel<SubModel>, AS extends string = null>(
		fields: TSelectExpression<SubModel, T, AS>,
	): SelectBuilder<
		AS extends null ? SubModel : RenameKey<SubModel, T, AS> & IModel,
		RenamePropForSelect<MergeSelections<BasicRecordProps<SubModel>, Selections, T>, T, AS>
	> {
		if (Array.isArray(fields)) this.select_fields += fields.join(', ');
		else if (typeof fields === 'string') this.select_fields += fields;
		else if (fields.$) {
			if (Array.isArray(fields.$)) {
				this.select_fields += fields.$.join(' ');
			} else {
				const field = fields.$ as keyof SubModel;
				this.#replaceExistingSelectedFields(field as string);
				this.select_fields += `, ${field as string} ${fields.as ? `AS ${fields.as}` : ''}`;
			}
		}

		return this as unknown as SelectBuilder<
			AS extends null ? SubModel : RenameKey<SubModel, T, AS> & IModel,
			RenamePropForSelect<MergeSelections<BasicRecordProps<SubModel>, Selections, T>, T, AS>
		>;
		// return new SelectBuilder<SubModel, RenamePropForSelect<MergeSelections<BasicRecordProps<SubModel>, Selections, T>, T, AS>>(
		// 	this.props,
		// 	this.select_fields,
		// );
	}

	public range(range: string[][] | number[]): SelectBuilder<SubModel, Selections> {
		this.query_range = joinRangeFields(range);
		return this;
	}

	public count<C extends SelectBuilderAny | keyof Selections, P extends CountParams<As, R & string>, As extends string, R extends keyof Selections = AsType<C>>(
		condition: C,
		options?: P,
	): SelectBuilder<SubModel, CountResult<Selections, AsType<C>, P>> {
		if (condition instanceof SelectBuilder) {
			this.count_condition = `${condition.build()}`;
		} else {
			this.count_condition = condition as string;
		}

		if (!options) return this as unknown as SelectBuilder<SubModel, CountResult<Selections, AsType<C>, P>>;

		const nested: [TComparisonOperator, number, string | undefined] = [undefined, undefined, undefined];

		for (const innerKey in options) {
			if (innerKey === 'replace') continue;
			if (innerKey === 'as') {
				if ('replace' in (options as object)) {
					this.#replaceExistingSelectedFields(options['replace'] as string);
				}
				nested[2] = `AS ${options[innerKey]}`;
				continue;
			}

			const operator = innerKey as TComparisonOperator;
			const countValue = options[operator];
			nested[0] = operator;
			nested[1] = countValue;
		}
		this.count_operator = nested;

		return this as unknown as SelectBuilder<SubModel, CountResult<Selections, AsType<C>, P>>;
	}

	public in(model: typeof Model | string): SelectBuilder<SubModel, Selections> {
		if (typeof model === 'string') this.subquery.push(model);
		else this.subquery.push(`->${new model().__tableName()}`);
		return this;
	}

	public of(model: typeof Model | string): SelectBuilder<SubModel, Selections> {
		if (typeof model === 'string') this.subquery?.push(model);
		else this.subquery?.push(`<-${new model().__tableName()}`);

		return this;
	}

	public orderBy(key: keyof SubModel, order: 'ASC' | 'DESC', extra?: 'COLLATE' | 'NUMERIC'): SelectBuilder<SubModel, Selections> {
		this.query_orderBy?.push([key.toString(), order, extra]);
		return this;
	}

	// ORDER BY RAND()
	public orderRandomly(): SelectBuilder<SubModel, Selections> {
		this.query_orderByRand = true;
		this.query_orderBy = [];
		return this;
	}

	/**
	 * SurrealDB supports data aggregation and grouping, with support for multiple fields, nested fields, and aggregate functions. In SurrealDB, every field which appears in the field projections of the select statement (and which is not an aggregate function), must also be present in the `GROUP BY` clause.
	 */
	public groupBy(fields?: (keyof SubModel)[]): SelectBuilder<SubModel, Selections> {
		if (fields) this.query_groupByFields = fields;
		this.query_groupBy = true;
		return this;
	}

	/**
	 * As SurrealDB supports arrays and nested fields within arrays, it is possible to split the result on a specific field name, returning each value in an array as a separate value, along with the record content itself. This is useful in data analysis contexts.
	 */
	public split(field: keyof SubModel): SelectBuilder<SubModel, Selections> {
		this.query_split = field.toString();
		return this;
	}

	/**
	 * To limit the number of records returned, using the `LIMIT` clause.
	 *	@param limit - Records limit
	 */
	public limit(limit: number): SelectBuilder<SubModel, Selections> {
		this.query_limit = limit;
		return this;
	}

	public start(start: number): SelectBuilder<SubModel, Selections> {
		this.query_start = start;
		return this;
	}

	public fetch<T extends keyof OnlyRecordProps<SubModel> & keyof Selections>(
		fields: T[],
	): SelectBuilder<SubModel, Simplify<Pick<SubModel, T> & Omit<Selections, T>>> {
		this.query_fetch_fields = fields.map((field) => field.toString());
		return this as unknown as SelectBuilder<SubModel, Simplify<Pick<SubModel, T> & Omit<Selections, T>>>;
	}

	public build(): string {
		let query = 'SELECT';
		if (this.subquery.length > 0 && this.query_from) query = query.concat(' ', this.subquery.join(''), '->', this.query_from);
		else query = query.concat(' ', this.select_fields);

		if (this.count_condition) query = query.concat(', ', 'count', '(', this.count_condition, ')', '', this.count_operator?.join(' ') ?? '');

		if (this.query_from) query = query.concat(' ', 'FROM ', this.query_from);

		if (this.query_range) query = query.concat(':', this.query_range);

		if (this.query_where) query = query.concat(' ', 'WHERE ', this.query_where);

		if (this.query_split) query = query.concat(' ', 'SPLIT ', this.query_split);
		if (this.query_fetch_fields.length > 0) query = query.concat(' ', 'FETCH ', this.query_fetch_fields.join(', '));

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

	public async execute(): Promise<Selections[]> {
		const response = await Lucid.client()?.query<Selections[]>(this.build());

		if (response.length === 0) {
			throw new Error('No response from server');
		}

		if (response[0].status !== 'OK') {
			throw new Error(response[0].status);
		}

		return response[0].result;
	}

	public live() {}
}
