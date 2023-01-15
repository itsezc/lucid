import { Account } from './account.spec';
import { DefaultSessionVars, ISurrealScope } from '../src/scope';

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
