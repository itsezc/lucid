import { IBasicModel, Model } from "./model.js";

type TPermissionsCallback<SubModel extends IBasicModel = Model> = {
	$scope: string;
	$auth: IDefaultContextAuth;
};

export type TSurrealPermissionOperation = "CREATE" | "UPDATE" | "DELETE" | "SELECT";

type TPermissionMultiple = [TSurrealPermissionOperation | TSurrealPermissionOperation[], string | boolean | object];

export type TPermissions<SubModel extends IBasicModel = Model> = (
	model: SubModel,
	args: TPermissionsCallback<SubModel>,
) =>
	| {
			select?: string | boolean | object;
			create?: string | boolean | object;
			update?: string | boolean | object;
			delete?: string | boolean | object;
	  }
	| TPermissionMultiple[];

/**
 * Surreal authentication context
 */
interface IDefaultContextAuth {
	/** Id of the user thats signed in */
	id: string;
}
