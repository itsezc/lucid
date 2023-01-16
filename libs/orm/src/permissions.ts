import { Model } from './model';

type TPermissionsCallback<SubModel extends Model = Model> = {
	$scope: string;
	$auth: IContextAuth;
};

type TPermissionCommand = 'CREATE' | 'UPDATE' | 'DELETE' | 'SELECT';

type TPermissionMultiple = [TPermissionCommand, string];

export type TPermissions<SubModel extends Model = Model> = (
	model: SubModel,
	args: TPermissionsCallback<SubModel>,
) =>
	| {
			select?: string | boolean | object;
			create?: string | boolean | object;
			update?: string | boolean | object;
			delete?: string | boolean | object;
	  }
	| TPermissionMultiple[][];

/**
 * Surreal authentication context
 */
export interface IContextAuth {
	/** Id of the user thats signed in */
	id: string;
}
