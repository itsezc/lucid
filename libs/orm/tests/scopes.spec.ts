import { Account } from './account.spec';
import { Scope } from '../src/scope';

export const $account = new Scope({
	name: 'account',
	timeout: '15m',
	table: Account,
	signin({ $email, $pass }) {
		return {};
	},
});

export const $admin = new Scope({
	name: 'admin',
	timeout: '15m',
	table: Account,
	signin({ $email, $pass }) {
		return {};
	},
});
