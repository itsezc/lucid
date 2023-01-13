import { Model } from './model';

import { Scope } from './scope';
import { Account } from './tests/account.spec';

/**
 * Surreal authentication context
 */
export interface IContextAuth {
	/** Id of the user thats signed in */
	id: string;
}

export type Permissions<SubModel extends Model = Model> = {
	select?: PermissionHandler<SubModel> | boolean;
	create?: PermissionHandler<SubModel> | boolean;
	update?: PermissionHandler<SubModel> | boolean;
	delete?: PermissionHandler<SubModel> | boolean;
};

type PermissionHandler<
	SubModel extends Model,
	ScopeInstance extends Scope = Scope,
> = {
	scope?: ScopeInstance[];
	auth?: [keyof SubModel, keyof IContextAuth];
	OR?: PermissionHandler<SubModel>;
};

const $account = new Scope({
	name: 'account',
	timeout: '15m',
	table: Account,
	signin({ $email, $pass }) {
		return {};
	},
});

const $admin = new Scope({
	name: 'admin',
	timeout: '15m',
	table: Account,
	signin({ $email, $pass }) {
		return {};
	},
});

let x = generatePermissions<Account>({
	create: false,
	delete: {
		auth: ['id', 'id'],
		scope: [$admin],
	},
	update: {
		scope: [$account, $admin],
		auth: ['id', 'id'],
	},
	select: {
		scope: [$account],
		auth: ['id', 'id'],
	},
});

let y = generatePermissions<Account>({
	create: true,
	delete: {
		auth: ['id', 'id'],
		OR: {
			scope: [$admin],
		},
	},
	update: {
		scope: [$account, $admin],
	},
	select: {
		scope: [$account],
		auth: ['id', 'id'],
	},
});

function addBrackets(str: string) {
	return `(${str})`;
}

function generatePermissions<T extends Model = Model>(
	config: Permissions<T>,
): string {
	let permissions = '';

	Object.entries(config).forEach(([key, value]) => {
		const permission = schemaPermissions(value, true);

		permissions += `FOR ${key} ${permission}\r\n`;
	});

	return permissions;
}

function schemaPermissions<SubModel extends Model>(
	value: boolean | PermissionHandler<SubModel>,
	root = false,
) {
	let permission = '';

	switch (value) {
		case true:
			permission = 'FULL';
			break;

		case false:
			permission = 'NONE';
			break;

		default:
			if (root) permission = 'WHERE ';

			if (value.auth) {
				permission += `${String(value.auth[0])} = auth.${value.auth[1]}`;
			}

			if (value.auth && value.scope) {
				permission += ' AND ';
			}

			if (value.scope) {
				const onlyOR = value.scope.length > 1 && value.auth;

				if (onlyOR) {
					permission += '(';
				}

				value.scope.forEach((scope, index, array) => {
					const last = index === array.length - 1;

					permission += `$scope = '${scope.props.name}'${last ? '' : ' OR '}`;
				});

				if (onlyOR) {
					permission += ')';
				}
			}

			if (value.OR) {
				permission += ` OR ${
					root
						? schemaPermissions(value.OR)
						: `(${schemaPermissions(value.OR)})`
				}`;
			}

			break;
	}

	return permission;
}
