import { SetOptional } from 'type-fest';
import { IModel, IBasicModel, Model } from '../model';
import { Simplify, OfArray } from '../utilities/helper.types';

export type OnlyRecordProps<T extends IModel> = { [P in keyof T as T[P] extends Model | Model[] ? P : never]: T[P] };
export type Basic<T> = {
	[P in keyof T]: T[P] extends Model
		? string
		: T[P] extends Model[]
		? string[]
		: T[P] extends Date
		? T[P]
		: T[P] extends object
		? Basic<T[P]>
		: OfArray<T[P]> extends { type: infer U }
		? Basic<U>[]
		: T[P];
};

export type OnlyRelationalProps<T extends IModel> = { [P in keyof T as T[P] extends Model<true> | Model<true>[] ? P : never]: T[P] };

export type SubsetModel<M extends PartialId<IBasicModel>> = ToBasicModel<{ [P in keyof M as M[P] extends Function ? never : P]: M[P] }>;

export type PartialId<SubModel extends IBasicModel> = SetOptional<SubModel, 'id'>;

export type MergeSelections<SubModel extends IBasicModel, Selections, NewKeys extends keyof SubModel | keyof Selections> = Simplify<
	Pick<SubModel & Basic<Selections>, keyof Selections | NewKeys>
>;

export type ToModel<T> = T & IModel;
export type ToBasicModel<T> = T & IBasicModel;

export type HasAtLeastTwoKeys<T, GoneBefore extends boolean = false> = {
	[K in keyof T]: GoneBefore extends true ? true : HasAtLeastTwoKeys<Omit<T, K>, true>;
}[keyof T];

// rome-ignore lint/suspicious/noExplicitAny: <explanation>
export type Length<T extends any[]> = T extends { length: infer L } ? (L extends 100 ? 100 : L) : never;

export type HasExactlyOneKey<T> = HasAtLeastTwoKeys<T> extends never ? (keyof T extends never ? false : true) : false;
