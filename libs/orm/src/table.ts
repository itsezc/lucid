import { Model } from './model';
import { TPermissions } from './permissions';

export type ITable<SubModel extends Model> = {
	edge?: boolean;
	auditable?: boolean;
	permissions?: TPermissions<SubModel>;
};

export function Table<SubModel extends Model = Model>(
	props?: ITable<SubModel>,
) {
	return function (fn: typeof Model) {};
}
