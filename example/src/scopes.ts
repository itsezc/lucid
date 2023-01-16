import { Account } from './account';
import { DefaultSessionVars, ISurrealScope } from '@surreal-tools/orm/src/scope';

export const AccountScope: ISurrealScope<DefaultSessionVars> = {
	name: 'account',
	timeout: '15m',
	table: Account,
	signin: (vars) => {},
	siginup: (vars) => {},
};

export const AdminScope: ISurrealScope<DefaultSessionVars> = {
	name: 'admin',
	timeout: '15m',
	table: Account,
	signin: (vars) => {},
	siginup: (vars) => {},
};