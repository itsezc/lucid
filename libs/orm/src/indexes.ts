import { IModel } from '.';

type TTableIndex<SubModel extends IModel, K extends keyof SubModel = keyof SubModel> = {
	columns: K[];
	type?: 'unique';
};

export function Index<SubModel extends IModel = IModel, Key = string | symbol>(props: TTableIndex<SubModel>) {
	return function (target: SubModel, propertyKey: Key) {};
}
