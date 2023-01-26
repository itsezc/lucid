import { Table, Model, Field, Decimal, Float, DateTime, TableSpec } from '@surreal-tools/orm';
import { Issue } from './issue';
import { IssueLabel } from './issue_label';
import { AccountScope, AdminScope } from './scopes';

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

	//DEFINE FIELD metadata.marketing TYPE boolean ASSERT exists
	//DEFINE FIELD metadata.cookies TYPE boolean ASSERT nothing

	@Field({ flexible: true })
	otherMetadata?: {};

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

console.log('Account Model:', 
	Account.select()
		.where({
			username: '',
			years_active: 8,
			verified: true,
			money: 40.51,
			birthday: {
				gt: new Date()
			},
			metadata: {
				realAge: 18,
				issue: {
					title: {
						endsWith: ''
					}
				}
			},
			logins: {
				when: new Date(),
				verified: false
			},
			OR: {
				birthday: new Date(),
				metadata: {
					realAge: 16,
					marketing: false,
				},
				OR: {
					money: 50000
				}
			}
		})
		.limit(10)
		.timeout('1m')
		.build()
	);

const spec = new TableSpec(Account);

spec.canOperateWithPermission({
	scope: AccountScope,
	model: new Account({}),
	query: Account.select()
});

Account.create({
	username: '',
	passKey: ''
});

Account.delete()
	.where({
		username: {
			contains: ''
		}
	})
	.returnAfter()
	.returnBefore()
	.returnDiff()
	.timeout('1s')
	.parallel();

Account.update()
	.content({
		username: '',
		verified: true,
		logins: [{
			verified: true
		}],
		metadata: {
		}
	})
	.parallel();