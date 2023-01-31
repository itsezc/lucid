import { sql } from '@surreal-tools/orm';
import { Account } from './account';
import { createScope } from '@surreal-tools/orm/src/scope';

export const AccountScope = createScope<Account, { $email: string, $password: string, $passKey: string }>({
	name: 'account',
	session: '15m',
	signin: ({ $email, $password, $passKey }) => {
		return sql('SELECT * FROM account WHERE username = $username AND (crypto::argon2::compare(password, $password))')
	},
	signup: ({ $email, $password, $passKey }) => {
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
});

export const AdminScope = createScope<Account, { $email: string, $password: string }>({
	name: 'admin',
	session: '15m',
	signin: ({ $email, $password }) => {
		return sql('SELECT * FROM account WHERE username = $username AND (crypto::argon2::compare(password, $password))')
	},
	signup: ({ $email, $password }) => {
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
});