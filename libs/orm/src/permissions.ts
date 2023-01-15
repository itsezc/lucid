import { Model } from './model';

type TPermissionsCallback<SubModel extends Model = Model> = {
	$scope: string;
	$auth: IContextAuth;
};

export type TPermissions<SubModel extends Model = Model> = (
	model: SubModel,
	args: TPermissionsCallback<SubModel>,
) => {
	select?: string | boolean;
	create?: string | boolean;
	update?: string | boolean;
	delete?: string | boolean;
};

/**
 * Surreal authentication context
 */
export interface IContextAuth {
	/** Id of the user thats signed in */
	id: string;
}
