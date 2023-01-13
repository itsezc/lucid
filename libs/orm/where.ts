import { Model } from './';

// Omit<SubModel, 'save' | 'getTableName'>]

type TModelProperties<SubModel extends Model> = {
	[P in keyof SubModel]: SubModel[P] extends number
		? SubModel[P] | ((value: SubModel[P]) => number)
		: SubModel[P];
};

export type TQueryArgs<SubModel extends Model> = {
	range?: string[][] | number[];
	where?: Partial<TModelProperties<SubModel>>;
};

type TQueryArgInt = {};
