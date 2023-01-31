import { Model } from './model';

type TPermissionsCallback<SubModel extends Model = Model> = {
	$scope: string;
	$auth: IDefaultContextAuth;
};

export type TSurrealPermissionOperation = 'CREATE' | 'UPDATE' | 'DELETE' | 'SELECT';

type TPermissionMultiple = [
	TSurrealPermissionOperation 
	| TSurrealPermissionOperation[], 
	string | boolean | object
];

export type TPermissions<SubModel extends Model = Model> = (
	model: SubModel,
	args: TPermissionsCallback<SubModel>,
) => {
	select?: string | boolean | object;
	create?: string | boolean | object;
	update?: string | boolean | object;
	delete?: string | boolean | object;
} | TPermissionMultiple[];

/**
 * Surreal authentication context
 */
interface IDefaultContextAuth {
	/** Id of the user thats signed in */
	id: string;
}