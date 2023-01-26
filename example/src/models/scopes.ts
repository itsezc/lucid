import { Account } from './account';
import { TDefaultSessionVars, ISurrealScope } from '@surreal-tools/orm/src/scope';

export const AccountScope: ISurrealScope<Account, TDefaultSessionVars & { passKey: string }> = {
	name: 'account',
	timeout: '15m',
	signin: (vars) => {
		return new Account()
	},
	signup: (vars) => {
		return new Account()
	},
};

export const AdminScope: ISurrealScope<Account, TDefaultSessionVars> = {
	name: 'admin',
	timeout: '15m',
	signin: (vars) => {
		return new Account()
	},
	signup: (vars) => {
		return new Account()
	},
};