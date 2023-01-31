import Lucid from './lucid';
import { Model } from './model';
import { TPermissions } from './permissions';
import { toSnakeCase } from './util';

export type ITable<SubModel extends Model> = {
	name?: string;
	edge?: boolean;
	auditable?: boolean;
	permissions?: TPermissions<SubModel>;
};

export function Table<SubModel extends Model = Model>(
	props?: ITable<SubModel>,
) {
	return function (fn: typeof Model) {
		const name = props?.name || toSnakeCase(fn.name);

		if (props) {
			Lucid.tableMetadata.set(
				fn.name, 
				{
					...Lucid.tableMetadata.get(fn.name),
					...props
				}
			);

			console.log(Lucid.tableMetadata);
		}
	};
}
