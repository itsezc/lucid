import { IModel, Model } from '..';
import { joinRangeFields } from '../util';
import { Builder, IBuilderProps } from './builder';
import { Lucid } from '../lucid';
import { Simplify, UnionToArray, OfArray, UnionToCommaString } from '../utilities/helper.types';
import { IsEmptyObject, IsEqual } from 'type-fest';
import { Basic, MergeSelections, OnlyRecordProps, SubsetModel, OnlyRelationalProps, HasAtLeastTwoKeys, HasExactlyOneKey } from './types';
import { EdgeModel, IBasicModel } from '../model';

type TComparisonOperator = '<' | '<=' | '=' | '>' | '>=';

type TEMP_KEY = 'RESULTS';
type TEMPORARY = { [P in TEMP_KEY]: IModel };

type TSelectOperation<SubModel extends IModel, T extends keyof SubsetModel<SubModel>, AS extends string> = {
	count: T;
	as?: AS;
};

export type TSelectExpression<SubModel extends IModel, T extends keyof SubsetModel<SubModel> | SelectBuilderAny, AS extends string> =
	| '*'
	| T[]
	| TSelectOperation<SubModel, Extract<T, string>, AS>[];

export type RenamePropForSelect<T, K extends keyof T, NewKey extends string> = NewKey extends null ? T : Simplify<Omit<T, K> & { [P in NewKey]: T[K] }>;

type FirstKey<T> = UnionToArray<keyof T> extends [infer U, ...unknown[]] ? U : never;

type TypeFromSelectBuilder<M extends IModel, Selects> = {
	[P in
		keyof Selects as IsEqual<Selects[P], M> extends true
			? P
			: OfArray<Selects[P]> extends { type: infer A }
			? IsEqual<A, M> extends true
				? P
				: never
			: never]: Selects[P];
} extends infer U
	? IsEmptyObject<U> extends true
		? TEMPORARY
		: U
	: never;

type KeysOfSB<T, Selects> = T extends SelectBuilder<infer M, unknown> ? keyof TypeFromSelectBuilder<M, Selects> : T;

type QueryOptions<AS extends string, Operation extends TComparisonOperator> = Simplify<{ [OP in Operation]?: number } & { as?: AS }>;

type CountResult<
	Selections,
	DefaultKey extends string,
	T extends QueryOptions<As, Operator>,
	As extends string,
	Operator extends TComparisonOperator,
> = Simplify<{
	[P in keyof Selections as P extends DefaultKey ? (T extends { as: infer U } ? U & string : P) : never]: // CHECK IF ANY OPERATOR IS SET
	HasExactlyOneKey<Omit<T, 'as'>> extends true ? boolean : number;
}>;

// rome-ignore lint/suspicious/noExplicitAny: <explanation>
export type SelectBuilderAny = SelectBuilder<Model, any>;

export type FetchFrom<M extends IModel, T extends keyof M> = {
	[P in T]: M[P] extends EdgeModel<infer IN, infer OUT> | EdgeModel<infer IN, infer OUT>[] ? OUT[] : M[P];
};

type SelectedFields<SubModel extends IModel> = {
	[P in keyof SubModel]: {
		key: P | '*';
		formattedField: string;
		as?: string;
		relational?: boolean;
	};
};

// rome-ignore lint/suspicious/noExplicitAny: <explanation>
type HandleNestedSelection<T, Selections> = T extends SelectBuilder<any, infer UU, infer IAlias>
	? IAlias extends null
		? HasAtLeastTwoKeys<UU> extends never
			? Simplify<Basic<Selections> & { [P in keyof UU as TEMP_KEY]: UU[P][] }>
			: Simplify<Basic<Selections> & { [TK in UnionToCommaString<keyof UU>]: UU[] }>
		: Simplify<Basic<Selections> & UU>
	: never;

export class SelectBuilder<
	SubModel extends IModel,
	Selections,
	Alias extends string = null,
	AcceptInput = keyof Selections | SelectBuilderAny,
	OriginalTypes = Pick<SubModel, keyof Selections & keyof SubModel>,
> extends Builder<SubModel> {
	private query_range?: string;

	//#region vars
	private subquery?: string[] = [];
	private count_condition?: string;
	private count_operator?: [TComparisonOperator, number?, string?];

	private query_select_fields: SelectedFields<SubModel> = {} as SelectedFields<SubModel>;
	private query_select_fields_projections?: string[];

	private query_split?: string;

	private query_orderByRand = false;
	private query_orderBy?: [string, 'ASC' | 'DESC', 'COLLATE' | 'NUMERIC' | undefined][];

	private query_fetch_fields?: string[] = [];

	private query_groupBy = false;
	private query_groupByFields?: (keyof Selections)[];

	private query_limit?: number;
	private query_start?: number;
	//#endregion

	constructor(props: IBuilderProps<SubModel>) {
		super(props);
	}

	public select<
		T extends keyof SubsetModel<SubModel> | SelectBuilderAny,
		AS extends string = null,
		MS = MergeSelections<Basic<SubModel> & IBasicModel, Selections, T & keyof SubModel>,
		SB = HandleNestedSelection<T, Selections> extends never ? MS : HandleNestedSelection<T, Selections>,
	>(fields: TSelectExpression<SubModel, T, AS>): SelectBuilder<SubModel, Simplify<SB>, Alias> {
		const metafields = Lucid.get(this.model.__tableName(true)).fields;
		if (!metafields) throw new Error(`No metafield found for model: ${this.model.__tableName(true)}`);

		if (Array.isArray(fields)) {
			let selections: SelectedFields<SubModel> = {} as SelectedFields<SubModel>;
			(fields as T[]).forEach((field) => {
				if (field instanceof SelectBuilder) {
					return;
				}
				const metafield = metafields[field as string];
				if (metafield) {
					if (metafield?.relation) {
						const { via, to, direction } = metafield.relation;
						const dirArrow = direction === 'IN' ? '<-' : '->';
						const alias = `${dirArrow}${new via().__tableName()}${dirArrow}${new to().__tableName()}`;
						selections[field as string] = { key: field, formattedField: alias as string, as: field as string, relational: true };
						return;
					}
				}
				selections[field as string] = { key: field, formattedField: `${field as string}` };
			});
			this.query_select_fields = {
				...this.query_select_fields,
				...selections,
			};
		} else if (typeof fields === 'string') {
			this.query_select_fields[fields] = { key: fields, formattedField: fields as string };
		}
		return this as unknown as SelectBuilder<SubModel, Simplify<SB>, Alias>;
	}

	public range(range: string[][] | number[]): SelectBuilder<SubModel, Selections> {
		this.query_range = joinRangeFields(range);
		return this;
	}

	public count<C extends AcceptInput, A extends string, O extends TComparisonOperator, P extends QueryOptions<A, O>, K = KeysOfSB<C, OriginalTypes>>(
		condition: C,
		options?: P,
	): SelectBuilder<SubModel, CountResult<Selections, K & string, P, A, O>, Alias> {
		if (condition instanceof SelectBuilder) {
			this.count_condition = `${condition.build()}`;
		} else {
			this.count_condition += condition as string;
		}

		if (!options) return this as unknown as SelectBuilder<SubModel, CountResult<Selections, K & string, P, A, O>, Alias>;

		const nested: [TComparisonOperator, number?, string?] = [undefined, undefined, undefined];

		for (const innerKey in options) {
			if (innerKey === 'replace') continue;
			if (innerKey === 'as') {
				if ('replace' in (options as object)) {
					const replace = options['replace'] as string;
					if (this.query_select_fields[replace]) {
						this.count_condition = this.query_select_fields[replace].formattedField;
						//// rome-ignore lint/performance/noDelete: <explanation>
						// delete this.query_select_fields[replace];
					}
				}
				nested[2] = `AS ${options[innerKey]}`;
				continue;
			}

			const operator = innerKey as TComparisonOperator;
			const countValue = options[operator];
			nested[0] = operator;
			nested[1] = countValue;
		}

		if (this.count_operator) {
			// rome-ignore lint/suspicious/noExplicitAny: <explanation>
			this.count_operator.push(nested as any);
		} else {
			this.count_operator = nested;
		}

		return this as unknown as SelectBuilder<SubModel, CountResult<Selections, K & string, P, A, O>, Alias>;
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

	public orderBy(key: keyof Selections, order: 'ASC' | 'DESC', extra?: 'COLLATE' | 'NUMERIC'): SelectBuilder<SubModel, Selections> {
		this.query_orderBy?.push([key.toString(), order, extra]);
		return this;
	}

	public as<ALIAS extends string>(
		alias: ALIAS,
	): SelectBuilder<
		SubModel,
		HasAtLeastTwoKeys<Selections> extends never ? { [P in keyof Selections as ALIAS]: Selections[P][] } : { [P in ALIAS]: Selections[] },
		ALIAS
	> {
		// this.query_alias = alias;
		return this as unknown as SelectBuilder<
			SubModel,
			HasAtLeastTwoKeys<Selections> extends never ? { [P in keyof Selections as ALIAS]: Selections[P][] } : { [P in ALIAS]: Selections[] },
			ALIAS
		>;
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
	public groupBy<GroupKey extends keyof Selections>(fields?: GroupKey[]): SelectBuilder<SubModel, Selections> {
		if (fields) this.query_groupByFields = fields;
		this.query_groupBy = true;
		return this;
	}

	/**
	 * As SurrealDB supports arrays and nested fields within arrays, it is possible to split the result on a specific field name, returning each value in an array as a separate value, along with the record content itself. This is useful in data analysis contexts.
	 */
	public split(field: keyof Selections): SelectBuilder<SubModel, Selections> {
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

	public fetch<T extends (keyof OnlyRecordProps<SubModel> | keyof OnlyRelationalProps<SubModel>) & keyof Selections>(
		fields: T[],
	): SelectBuilder<SubModel, Simplify<FetchFrom<SubModel, T> & Omit<Selections, T>>> {
		this.query_fetch_fields = fields.map((field) => field.toString());
		return this as unknown as SelectBuilder<SubModel, Simplify<FetchFrom<SubModel, T> & Omit<Selections, T>>>;
	}

	public build(): string {
		let query = 'SELECT';
		if (this.subquery.length > 0 && this.query_from) query = query.concat(' ', this.subquery.join(''), '->', this.query_from);
		// else query = query.concat(' ', this.select_fields);

		if (Object.keys(this.query_select_fields).length > 0) {
			query = query.concat(
				' ',
				Object.values(this.query_select_fields)
					.map((field) => {
						return `${field.formattedField}${field.as ? ` AS ${field.as}` : ''}`;
					})
					.join(', '),
			);
		}

		// if (this.count_condition) query = query.concat(' ', 'count', '(', this.count_condition, ')', ' ', this.count_operator?.join('') ?? '');

		if (this.query_from) query = query.concat(' ', 'FROM ', this.query_from);

		if (this.query_range) query = query.concat(':', this.query_range);

		if (this.query_where) query = query.concat(' ', 'WHERE ', this.query_where);

		if (this.query_split) query = query.concat(' ', 'SPLIT ', this.query_split);

		// @todo - OrderBy calculation
		if (this.query_orderBy) query = query.concat();
		if (this.query_orderByRand) query = query.concat(' ', 'ORDER BY RAND()');

		// @todo - GroupBy calculation
		if (this.query_groupByFields) query = query.concat(' ', 'GROUP BY ', this.query_groupByFields.join(', '));

		if (this.query_groupBy && this.query_select_fields_projections) query = query.concat(' ', 'GROUP BY ', this.query_select_fields_projections.join(', '));
		if (this.query_fetch_fields.length > 0) query = query.concat(' ', 'FETCH ', this.query_fetch_fields.join(', '));

		if (this.query_limit) query = query.concat(' ', 'LIMIT ', this.query_limit.toString());
		if (this.query_start) query = query.concat(' ', 'START ', this.query_start.toString());
		if (this.query_timeout) query = query.concat(' ', 'TIMEOUT ', this.query_timeout);
		if (this.query_parallel) query = query.concat(' ', 'PARALLEL');

		query += ';';

		console.log(query);
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
