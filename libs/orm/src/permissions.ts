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
			select?: string | boolean;
			create?: string | boolean;
			update?: string | boolean;
			delete?: string | boolean;
	  }
	| TPermissionMultiple[][];

/**
 * Surreal authentication context
 */
export interface IContextAuth {
	/** Id of the user thats signed in */
	id: string;
}
