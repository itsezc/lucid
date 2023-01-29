import { count, sql } from '@surreal-tools/orm';
import { Account } from './account';
import { TDefaultSessionVars, ISurrealScope } from '@surreal-tools/orm/src/scope';

export const AccountScope: ISurrealScope<Account, TDefaultSessionVars & { $passKey: string }> = {
	name: 'account',
	session: '15m',
	signin: ({ $email, $pass, $passKey }) => {
		return sql('SELECT * FROM account WHERE username = $username AND (crypto::argon2::compare(password, $password))')
	},
	signup: ({ $email, $pass, $passKey }) => {
		return sql(`
		IF count( (SELECT * FROM account WHERE verified = true AND username = $username) ) = 0
			THEN (
				CREATE account
					SET
						username = $username,
						passKey = $passKey,
						password = crypto::argon2::generate($password)
			)
			END
		`)
	},
};

export const AdminScope: ISurrealScope<Account, TDefaultSessionVars> = {
	name: 'admin',
	session: '15m',
	signin: ({ $email, $pass }) => {
		return sql('SELECT * FROM account WHERE username = $username AND (crypto::argon2::compare(password, $password))')
	},
	signup: ({ $email, $pass }) => {
		return sql(`
		IF count( (SELECT * FROM account WHERE verified = true AND username = $username) ) = 0
			THEN (
				CREATE account
					SET
						username = $username,
						passKey = $passKey,
						password = crypto::argon2::generate($password)
			)
			END
		`)
	},
};