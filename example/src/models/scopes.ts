import { count } from '@surreal-tools/orm';
import { Account } from './account';
import { TDefaultSessionVars, ISurrealScope } from '@surreal-tools/orm/src/scope';

export const AccountScope: ISurrealScope<Account, TDefaultSessionVars & { $passKey: string }> = {
	name: 'account',
	timeout: '15m',
	signin: ({ $email, $pass, $passKey }) => {
		return Account
			.select()
			.where({ 
				email: $email,
			})
			.build()
	},
	signup: ({ $email, $pass, $passKey }) => {
		return new Account().save()
	},
};

export const AdminScope: ISurrealScope<Account, TDefaultSessionVars> = {
	name: 'admin',
	timeout: '15m',
	signin: ({ $email, $pass }) => {
		return new Account()
	},
	signup: ({ $email, $pass }) => {
		return new Account()
	},
};