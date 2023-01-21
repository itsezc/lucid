import { Model } from './';

type TModelProperties<SubModel extends Model> = {
	[P in keyof Omit<SubModel, 'save' | 'getTableName'>]: SubModel[P];
};

export type TQueryArgs<SubModel extends Model> = {
	range?: string[][] | number[];
	where?: Partial<TModelProperties<SubModel>>;
	timeout?: `${number}s`;
};

type TQueryArgInt = {};
