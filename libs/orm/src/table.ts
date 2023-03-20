import Lucid, { ITable } from './lucid';
import { Model } from './model';
import { toSnakeCase } from './util';
import { Constructor } from 'type-fest';

export function Table<SubModel extends Model<boolean>, Name extends string, Edge extends boolean>(props?: ITable<SubModel, Name, Edge>) {
	return (ctor: Constructor<SubModel>) => {
		const name = props?.name || toSnakeCase(ctor.name);
		const prototype = ctor.prototype as Model;
		// prototype.__modelName = name;
		// prototype.edge = props?.edge;

		if (props) {
			Lucid.set(ctor.name, {
				table: {
					...Lucid.get(ctor.name)?.table,
					...props,
					name,
				},
				fields: Lucid.get(ctor.name)?.fields || {},
			});
		}
	};
}
