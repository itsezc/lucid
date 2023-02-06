import Lucid from './lucid';
import { IBasicModel, IModel } from './model';
import { TPermissions } from './permissions';
import { toSnakeCase } from './util';
import { Constructor } from 'type-fest';

export type ITable<SubModel extends IBasicModel, Name extends string = string> = {
	name: Name;
	edge?: boolean;
	auditable?: boolean;
	permissions?: TPermissions<SubModel>;
};

export function Table<SubModel extends IModel, Name extends string>(props?: ITable<SubModel, Name>) {
	return (ctor: Constructor<SubModel>) => {
		const name = props?.name || toSnakeCase(ctor.name);
		// console.log(new ctor());
		// (ctor.prototype as SubModel).__modelName = name; // a trick to basically set the model name, by having a field on the Model class we can assign it, otherwise it does not work lol
		if (props) {
			Lucid.set(ctor.name, {
				...Lucid.get(ctor.name),
				...props,
				name,
			});
		}
	};
}
