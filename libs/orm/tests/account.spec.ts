import { Table, Model, Field } from '../src';
import { Issue } from './issue.spec';
import { AdminScope } from './scopes.spec';

@Table<Account>({
	permissions: {
		create: { scope: [AdminScope] },
		delete: false,
		select: { auth: ['id', 'id'] },
		update: { auth: ['id', 'id'] }
	},
	auditable: true,
})
export class Account extends Model {
	@Field({ index: 'unique' })
	username?: string;

	@Field()
	emails: { active: boolean }[];

	@Field({
		permissions: {
			create: false,
			select: false,
			delete: false,
			update: { auth: ['id', 'id'] }
		}
	})
	password?: string;

	@Field()
	passKey?: string;

	@Field()
	verified?: boolean;

	@Field()
	years_active?: number;
}

Account.events([
	{
		name: 'change_username',
		when: ({ $after, $before }) => ({
			$: [
				{
					$: [$before.username, '!=', $after.username],
				},
				{
					$: [$before.passKey, '!=', $after.username],
				},
			],
			OR: [
				{
					$: [$before.username, '!=', $after.username],
				},
			],
		}),
		then: ({ $after, $before }) => Issue.create().build(),
	},
]);

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
