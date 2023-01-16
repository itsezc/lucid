import { Table, Model, Field, Scope } from '@surreal-tools/orm';
import { Issue } from './issue';
import { AdminScope } from './scopes';

@Table<Account>({
	permissions: () => ({
		create: true,
		select: AdminScope,
		delete: true,
		update: true
	}),
	auditable: true,
})
export class Account extends Model {
	@Field({ index: 'unique' })
	username?: string;

	@Field({ assert: 'email' })
	email: string;

	@Field({
		permissions: ({ id }, { $auth }) => ({
			create: false,
			select: false,
			delete: false,
			update: id === $auth.id
		})
	})
	password?: string;

	passKey?: string;

	verified?: boolean;

	years_active?: number;
}

// Account.events([
// 	{
// 		name: 'change_username',
// 		when: ({ $after, $before, $event }) =>
// 			($before.username !== $after.username &&
// 				$before.passKey !== $after.passKey &&
// 				$event === 'CREATE') ||
// 			$before.username !== $before.username,
// 		then: ({ $after, $before }) => Issue.create().build(),
// 	},
// ]);

// // SELECT * FROM account WHERE username = 'test';
// Account.query({
// 	where: { username: 'string' },
// }).execute();

// // Select all account records with IDs between the given range
// // SELECT * FROM account:1..1000;
// Account.query({
// 	range: [1, 1000],
// }).execute();

// // Select all account records with IDs between the given range
// // SELECT * FROM account:['London', '2022-08-29T08:03:39']..['London', '2022-08-29T08:09:31'];
// Account.query({
// 	range: [
// 		['London', '2022-08-29T08:03:39'],
// 		['London', '2022-08-29T08:09:31'],
// 	],
// }).execute();

// // With Select (Select changes type?):
// // SELECT username, verified FROM account WHERE username = 'test';
// Account.query({ where: { username: 'test' } })
// 	.select(['username', 'verified'])
// 	.execute();
