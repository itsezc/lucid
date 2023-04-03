import { joinRangeFields } from "../../util.js";
import { Builder, IBuilderProps } from "../builder.js";
import { Lucid } from "../../lucid.js";
import { Simplify } from "../../utilities/helper.types.js";
import { FetchFrom, SelectOutput, SelectedFields, TComparisonOperator, TSelectExpression, TSelectInput } from "./types.js";
import { IModel, Model } from "../../model.js";
import { HasAtLeastTwoKeys, OnlyModelProps, SubsetModel } from "../types.js";

export class SelectBuilder<SubModel extends IModel, Selections, Alias extends string | null = null, Limited extends boolean = false> extends Builder<SubModel, Selections> {
	private query_range?: string;

	//#region vars
	private subquery: string[] = [];

	private query_select_fields: SelectedFields<SubModel> = {} as SelectedFields<SubModel>;
	private query_select_fields_projections?: string[];

	private query_split?: string;

	private query_alias?: string;

	private query_orderByRand = false;
	private query_orderBy?: [string, "ASC" | "DESC", "COLLATE" | "NUMERIC" | undefined][] = [];

	private query_fetch_fields?: string[] = [];

	private query_groupBy = false;
	private query_groupByFields?: (keyof Selections)[];

	private query_limit?: number;
	private query_start?: number;
	//#endregion

	constructor(props: IBuilderProps<SubModel>) {
		super(props);
	}

	public select<SelectAlias extends string, T extends TSelectExpression<SubsetModel<SubModel>, SelectAlias>>(
		fields: T,
	): SelectBuilder<SubModel, SelectOutput<SubsetModel<SubModel>, Selections, T[number]>, Alias, Limited> {
		const metafields = Lucid.get(this.model.__tableName(true))?.fields;
		if (!metafields) throw new Error(`No metafield found for model: ${this.model.__tableName(true)}`);

		if (Array.isArray(fields)) {
			let selections: SelectedFields<SubModel> = {} as SelectedFields<SubModel>;

			(fields as T[]).forEach((field: TSelectInput<SubModel, SelectAlias>) => {
				if (typeof field === "object") {
					if ("count" in field) {
						const { count, as: asField, ...rest } = field;
						const metafield = metafields[count as string]; // todo: add for relational

						const operator = Object.keys(rest)[0] as TComparisonOperator;
						const value = (rest as { [P in TComparisonOperator]: number | boolean })[operator];

						if (operator && value) {
							//@ts-ignore
							(selections[count] as any) = {
								key: count,
								formattedField: `count(${count as string}) ${operator} ${value}`,
								as: asField as string,
							};
						} else {
							//@ts-ignore
							(selections[count] as any) = { key: count, formattedField: `count(${count as string})`, as: asField || (count as string) };
						}
					} else if ("sum" in field) {
						const { sum, as: asField, ...rest } = field;
						const metafield = metafields[sum as string]; // todo: add for relational

						const operator = Object.keys(rest)[0] as TComparisonOperator;
						const value = (rest as { [P in TComparisonOperator]: number | boolean })[operator];

						if (operator && value) {
							//@ts-ignore
							(selections[sum] as any) = {
								key: sum,
								formattedField: `math::sum(${sum as string}) ${operator} ${value}`,
								as: asField as string,
							};
						} else {
							//@ts-ignore
							(selections[sum] as any) = { key: sum, formattedField: `math::sum(${sum as string})`, as: asField || (sum as string) };
						}
					} else if ("key" in field) {
						const { key, as: asField, ...rest } = field;
						const metafield = metafields[key as string]; // todo: add for relational

						const operator = Object.keys(rest)[0] as TComparisonOperator;
						const value = (rest as { [P in TComparisonOperator]: number | boolean })[operator];

						if (operator && value) {
							//@ts-ignore
							(selections[key] as any) = {
								key: key,
								formattedField: `${key as string} ${operator} ${value}`,
								as: asField as string,
							};
						} else {
							//@ts-ignore
							(selections[key] as any) = { key: key, formattedField: `${key as string}`, as: asField || (key as string) };
						}
					}
					return;
					//@ts-ignore
				} else if (field instanceof SelectBuilder) {
					const subquery = field.build(true);
					this.subquery?.push(subquery);
					return;
				}
				const metafield = metafields[field as string];
				if (metafield) {
					if (metafield?.relation) {
						const { via, to, direction } = metafield.relation;
						const dirArrow = direction === "IN" ? "<-" : "->";
						const alias = `${dirArrow}${new via().__tableName()}${dirArrow}${new to().__tableName()}`;
						//@ts-ignore
						selections[field] = { key: field, formattedField: alias as string, as: field as string, relational: true };
						return;
					}
				}
				//@ts-ignore
				selections[field] = { key: field, formattedField: `${field as string}` };
			});
			this.query_select_fields = {
				...this.query_select_fields,
				...selections,
			};
		} else if (typeof fields === "string") {
			(this.query_select_fields as any)[fields] = { key: fields, formattedField: fields as string };
		}
		return this as unknown as SelectBuilder<SubModel, SelectOutput<SubsetModel<SubModel>, Selections, T[number]>, Alias, Limited>;
	}

	public range(range: string[][] | number[]): SelectBuilder<SubModel, Selections, Alias, Limited> {
		this.query_range = joinRangeFields(range);
		return this;
	}

	public count<Key extends keyof SubsetModel<SubModel> | "*">(field: Key): SelectBuilder<SubModel, Omit<Selections, Key> & { [P in Key]: number }, Alias> {
		(this.query_select_fields as any)[field as string] = { key: field, formattedField: `count(${field as string})` };
		return this as unknown as SelectBuilder<SubModel, Omit<Selections, Key> & { [P in Key]: number }, Alias>;
	}

	public in(model: typeof Model | string): SelectBuilder<SubModel, Selections, Alias, Limited> {
		if (typeof model === "string") this.subquery?.push(model);
		else this.subquery?.push(`->${new model().__tableName()}`);
		return this;
	}

	public of(model: typeof Model | string): SelectBuilder<SubModel, Selections, Alias, Limited> {
		if (typeof model === "string") this.subquery?.push(model);
		else this.subquery?.push(`<-${new model().__tableName()}`);

		return this;
	}

	public orderBy(key: keyof Selections, order: "ASC" | "DESC", extra?: "COLLATE" | "NUMERIC"): SelectBuilder<SubModel, Selections, Alias, Limited> {
		console.log("ORDER BY", key, order, extra);
		this.query_orderBy?.push([key.toString(), order, extra]);
		return this;
	}

	public as<NewAlias extends string>(
		alias: NewAlias,
	): SelectBuilder<SubModel, HasAtLeastTwoKeys<Selections> extends never ? { [P in keyof Selections as NewAlias]: Selections[P] } : { [P in NewAlias]: Selections }, NewAlias> {
		this.query_alias = alias;
		return this as unknown as SelectBuilder<
			SubModel,
			HasAtLeastTwoKeys<Selections> extends never ? { [P in keyof Selections as NewAlias]: Selections[P] } : { [P in NewAlias]: Selections },
			NewAlias
		>;
	}

	// ORDER BY RAND()
	public orderRandomly(): SelectBuilder<SubModel, Selections, Alias, Limited> {
		this.query_orderByRand = true;
		this.query_orderBy = [];
		return this;
	}

	/**
	 * SurrealDB supports data aggregation and grouping, with support for multiple fields, nested fields, and aggregate functions. In SurrealDB, every field which appears in the field projections of the select statement (and which is not an aggregate function), must also be present in the `GROUP BY` clause.
	 */
	public groupBy<GroupKey extends keyof Selections>(...fields: GroupKey[]): SelectBuilder<SubModel, Selections, Alias, Limited> {
		if (fields) this.query_groupByFields = fields;
		this.query_groupBy = true;
		return this;
	}

	/**
	 * As SurrealDB supports arrays and nested fields within arrays, it is possible to split the result on a specific field name, returning each value in an array as a separate value, along with the record content itself. This is useful in data analysis contexts.
	 */
	public split(field: keyof Selections): SelectBuilder<SubModel, Selections, Alias, Limited> {
		this.query_split = field.toString();
		return this;
	}

	/**
	 * To limit the number of records returned, using the `LIMIT` clause.
	 *	@param limit - Records limit
	 */
	public limit(limit: number): SelectBuilder<SubModel, Selections, Alias, true> {
		this.query_limit = limit;
		return this as unknown as SelectBuilder<SubModel, Selections, Alias, true>;
	}

	public start(start: number): SelectBuilder<SubModel, Selections, Alias, Limited> {
		this.query_start = start;
		return this;
	}

	public fetch<T extends keyof OnlyModelProps<SubModel>>(fields: T[]): SelectBuilder<SubModel, Simplify<FetchFrom<SubModel, T> & Omit<Selections, T>>> {
		this.query_fetch_fields = fields.map((field) => field.toString());
		return this as unknown as SelectBuilder<SubModel, Simplify<FetchFrom<SubModel, T> & Omit<Selections, T>>>;
	}

	public build(isSubquery?: boolean): string {
		let query = isSubquery ? "(SELECT" : "SELECT";
		// if (this.subquery.length > 0 && this.query_from) query = query.concat(' ', this.subquery.join(''), '->', this.query_from);
		if (this.subquery.length > 0 && this.query_from) query = query.concat(" ", this.subquery.join(""), ",");

		// else query = query.concat(' ', this.select_fields);

		if (Object.keys(this.query_select_fields).length > 0) {
			query = query.concat(
				" ",
				Object.values(this.query_select_fields)
					.map((field) => {
						return `${field.formattedField}${field.as ? ` AS ${field.as}` : ""}`;
					})
					.join(", "),
			);
		}

		if (this.query_from) query = query.concat(" ", "FROM ", this.query_from);

		if (this.query_range) query = query.concat(":", this.query_range);

		if (this.query_where) query = query.concat(" ", "WHERE ", this.query_where);

		if (this.query_split) query = query.concat(" ", "SPLIT ", this.query_split);

		// @todo - GroupBy calculation
		if (this.query_groupByFields) query = query.concat(" ", "GROUP BY ", this.query_groupByFields.join(", "));

		if (this.query_groupBy && this.query_select_fields_projections) query = query.concat(" ", "GROUP BY ", this.query_select_fields_projections.join(", "));

		// @todo - OrderBy calculation
		if (this.query_orderBy) query = query.concat(" ", "ORDER BY ", this.query_orderBy.map((field) => field.filter((s) => !!s).join(" ")).join(", "));
		if (this.query_orderByRand) query = query.concat(" ", "ORDER BY RAND()");

		if (this.query_limit) query = query.concat(" ", "LIMIT ", this.query_limit.toString());

		if (this.query_start) query = query.concat(" ", "START ", this.query_start.toString());

		if ((this.query_fetch_fields?.length ?? 0) > 0) query = query.concat(" ", "FETCH ", this.query_fetch_fields?.join(", ") ?? "");

		if (this.query_timeout) query = query.concat(" ", "TIMEOUT ", this.query_timeout);
		if (this.query_parallel) query = query.concat(" ", "PARALLEL");

		if (!isSubquery) query += ";";
		else query += ")";

		if (this.query_alias) query = query.concat(" ", "AS ", this.query_alias);

		console.log(`Building query: ${query}`);
		return query;
	}

	public async execute(): Promise<Limited extends true ? Selections : Selections[]> {
		console.log(this.build());
		console.log("------------------------------------------");
		const response = await Lucid.client()?.query<Selections[]>(this.build());

		if (response.length === 0) {
			throw new Error("No response from server");
		}

		if (response[0].status !== "OK") {
			throw new Error(response[0].status);
		}

		if (this.query_limit === 1 && response[0].result) {
			return response[0].result[0] as unknown as Limited extends true ? Selections : Selections[];
		}
		return response[0].result as unknown as Limited extends true ? Selections : Selections[];
	}

	public live() {}
}
