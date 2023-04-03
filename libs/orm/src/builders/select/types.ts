import { IsEqual, IsEmptyObject, Simplify } from "type-fest";
import { EdgeModel, IBasicModel, IModel, Model } from "../../model.js";
import { OfArray, UnionToCommaString } from "../../utilities/helper.types.js";
import { SubsetModel, HasAtLeastTwoKeys, Basic, HasExactlyOneKey, MergeSelections } from "../types.js";
import { SelectBuilder } from "./select_builder.js";

type TEMP_KEY = "RESULTS";
type TEMPORARY = { [P in TEMP_KEY]: IModel };
export const SELECT_TYPE_OPERATIONS = {
	count: "count",
	key: "key",
	avg: "avg",
	sum: "sum",
} as const;

export const SELECT_OPERATION_KEYS = Object.keys(SELECT_TYPE_OPERATIONS) as SelectOperationsKeys[];

export type TComparisonOperator = "<" | "<=" | "=" | ">" | ">=";
export type SelectOperationsKeys = keyof typeof SELECT_TYPE_OPERATIONS;
export type SelectBuilderAny = SelectBuilder<Model, any>;

type TSelectOperation<SubModel extends IBasicModel, T extends keyof SubsetModel<SubModel>, AS extends string> = {
	[K in SelectOperationsKeys]?: T;
} & QueryOptions<AS, TComparisonOperator>;

export type TSelectInput<SubModel extends IBasicModel, Alias extends string> =
	| keyof SubsetModel<SubModel>
	| SelectBuilderAny
	| TSelectOperation<SubModel, keyof SubsetModel<SubModel>, Alias>;

export type TSelectExpression<SubModel extends IBasicModel, Alias extends string> = TSelectInput<SubModel, Alias>[] | "*";

export type TypeFromSelectBuilder<M extends IModel, Selects> = {
	[P in keyof Selects as IsEqual<Selects[P], M> extends true ? P : OfArray<Selects[P]> extends { type: infer A } ? (IsEqual<A, M> extends true ? P : never) : never]: Selects[P];
} extends infer U
	? IsEmptyObject<U> extends true
		? TEMPORARY
		: U
	: never;

type QueryOptions<AS extends string, Operation extends TComparisonOperator> = Simplify<{ [OP in Operation]?: number } & { as?: AS }>;

export type FetchFrom<M extends IModel, T extends keyof M> = {
	[P in T]: M[P] extends EdgeModel<infer IN, infer OUT> | EdgeModel<infer IN, infer OUT>[] ? OUT[] : M[P];
};

export type SelectedFields<SubModel extends IModel> = {
	[P in keyof SubModel]: {
		key: P | "*";
		formattedField: string;
		as?: string;
		relational?: boolean;
	};
};

type HandleNestedSelection<T, Selections> = T extends SelectBuilder<any, infer UU, infer IAlias>
	? IAlias extends null
		? HasAtLeastTwoKeys<UU> extends never
			? Simplify<Basic<Selections> & { [P in keyof UU as `${TEMP_KEY}_${UnionToCommaString<keyof UU>}`]: UU[P] }>
			: Simplify<Basic<Selections> & { [TK in UnionToCommaString<keyof UU>]: UU }>
		: Simplify<Basic<Selections> & UU>
	: never;

type ParseOptions<T, Selections, Submodel> = T extends {
	[P in SelectOperationsKeys]?: infer CKey;
}
	? Omit<Selections, CKey & keyof Selections> & {
			[P in T extends { as?: infer U } ? U : CKey as P extends string ? P : never]: HasExactlyOneKey<Omit<T, "as" | SelectOperationsKeys>> extends true
				? boolean
				: CKey extends "count"
				? number
				: Basic<Submodel[CKey & keyof Submodel]>;
	  }
	: never;

export type SelectOutput<SubModel extends IBasicModel, Selections, T extends TSelectExpression<SubModel, string>[number]> = SubModel extends object
	? HandleNestedSelection<T, Selections> extends never
		? ParseOptions<T, Selections, SubModel> extends never
			? MergeSelections<Basic<SubModel> & IBasicModel, Selections, T & keyof Basic<SubModel>>
			: Simplify<ParseOptions<T, MergeSelections<Basic<SubModel> & IBasicModel, Selections, T & keyof Basic<SubModel>>, SubModel>>
		: HandleNestedSelection<T, Selections>
	: never;
