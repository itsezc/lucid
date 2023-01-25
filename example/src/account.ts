import { Table, Model, Field, Decimal, Float, DateTime, sql } from '@surreal-tools/orm';
import { Issue } from './issue';
import { IssueLabel } from './issue_label';
import { AdminScope } from './scopes';

@Table<Account>({
	permissions: () => ({
		create: false,
		select: AdminScope,
		delete: true,
		update: true
	}),
	auditable: true,
})
export class Account extends Model {
	@Field({ index: 'unique' })
	username?: string;

	@Field({ assert: 'email', name: 'email_address' })
	email!: string;

	@Field({
		permissions: ({ id }, { $auth }) => ({
			create: false,
			select: AdminScope,
			delete: true,
			update: id === $auth.id
		})
	})
	password!: string;

	passKey?: string;

	verified?: boolean;

	money?: Decimal;

	floatExample?: Float;

	birthday?: DateTime;

	metadata?: {
		realAge: number;
		marketing: boolean;
		cookies?: boolean;
		issue?: Issue;
	};

	@Field({ flexible: true })
	otherMetadata?: {};

	//DEFINE FIELD metadata.marketing TYPE boolean ASSERT exists
	//DEFINE FIELD metadata.cookies TYPE boolean ASSERT nothing

	logins?: {
		when: DateTime;
		verified?: boolean;
	}[];

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

// With Select (Select changes type?):
// SELECT username, verified FROM account WHERE username = 'test';
// Account.query({ where: { username: 'test' } })
// 	.select(['username', 'verified'])
// 	.execute();

// Account.query({ where: { username: 'test' } })
// 	.select(['username', 'verified'])
// 	.count(
// 		Issue.query()
// 			.in(IssueLabel),
// 		'<', 5
// 	)
// 	.execute();

// Account.query({ 
// 		where: { username: 'test' },
// 		timeout: '10s',
// 	})
// 	.select(['username', 'verified'])
// 	.split('passKey')
// 	.orderBy('passKey', 'DESC', 'COLLATE')
// 	.groupBy()
// 	.parallel()
// 	.limit(5)
// 	.execute();

// Account.query()
// 	.select('*')
// 	.select(['username', 'passKey'])
// 	.select({
// 		$: 'birthday',
// 		as: 'dob'
// 	})
// 	.select({ $: ['birthday', '>=', '18'], as: 'date' })
// 	.select([
// 		{ $: ['username', '=', 'Arthur fleck'], as: 'joker' },
// 		{ $: ['birthday', '>=', '18'], as: 'date' }
// 	])
// 	.select([
// 		'*',
// 		{
// 			$$: 'tags.*.value',
// 			as: 'tags'
// 		}
// 	])
// 	.select([
// 		{
// 			$: 'username',
// 			where: 'active = true'
// 		}
// 	])
// 	.select([
// 		{ 
// 			$$: '->like->friend.name',
// 			as: 'farenheit'
// 		}
// 	])
// 	.select([
// 		{ 
// 			$$: '((celcius * 2) + 30)',
// 			as: 'farenheit'
// 		}
// 	])
// 	.select([
// 		{
// 			$$: {
// 				username: 'xD'
// 			},
// 			as: 'marketing_settings'
// 		}
// 	])
// 	.select([
// 		'*',
// 		{
// 			$$: sql(
// 				'SELECT * FROM events WHERE host == $parent.id', 
// 				{ subquery: true }
// 			),
// 			as: 'self_hosted'
// 		}
// 	])

Account.query()
	.where({
		username: '',
		years_active: 8,
		verified: true,
		birthday: {
			gt: new Date()
		},
		metadata: {
			realAge: 18,
			cookies: true,
			issue: {
				title: {
					endsWith: ''
				}
			}
		},
		OR: {
			birthday: new Date(),
			metadata: {
				realAge: 16,
				marketing: false,
			}
		}
	})
	.build();