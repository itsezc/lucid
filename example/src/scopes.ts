import { Account } from './account';
import { DefaultSessionVars, ISurrealScope } from '@surreal-tools/orm/src/scope';

export const AccountScope: ISurrealScope<Account, DefaultSessionVars> = {
	name: 'account',
	timeout: '15m',
	signin: (vars) => {
		return new Account()
	},
	siginup: (vars) => {
		return new Account()
	},
};

export const AdminScope: ISurrealScope<Account, DefaultSessionVars> = {
	name: 'admin',
	timeout: '15m',
	signin: (vars) => {
		return new Account()
	},
	siginup: (vars) => {
		return new Account()
	},
};