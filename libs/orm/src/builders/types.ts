import { SetOptional } from 'type-fest';
import { IModel, IBasicModel } from '../model';
import { Simplify } from '../utilities/helper.types';

export type OnlyRecordProps<T extends IModel> = { [P in keyof T as T[P] extends IModel | IModel[] ? P : never]: T[P] };
export type BasicRecordProps<T extends IBasicModel> = {
	[P in keyof T]: T[P] extends IModel ? string : T[P] extends IModel[] ? string[] : T[P];
} & IModel;

export type SubsetModel<M extends PartialId<IBasicModel>> = ToBasicModel<{ [P in keyof M as M[P] extends Function ? never : P]: M[P] }>;

export type PartialId<SubModel extends IBasicModel> = SetOptional<SubModel, 'id'>;

export type MergeSelections<SubModel extends IModel, Selections, NewKeys extends keyof SubModel | keyof Selections> = Simplify<
	Pick<SubModel & BasicRecordProps<Selections & IModel>, NewKeys | keyof Selections>
>;

export type ToModel<T> = T & IModel;
export type ToBasicModel<T> = T & IBasicModel;
