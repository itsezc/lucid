import { Model } from '.';

type TTableIndex<SubModel extends Model> = {
	columns: keyof SubModel[];
	type?: 'unique';
};

export function Index<SubModel extends Model = Model, Key = string | symbol>(
	props: TTableIndex<SubModel>,
) {
	return function (target: SubModel, propertyKey: Key) {};
}
