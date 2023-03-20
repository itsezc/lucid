import { Table, Model, Field, type Types, SurrealEvent, Index } from '@lucid-framework/orm';
import { Issue } from './issue';
import { IssueLabel } from './issue_label';
import { AdminScope, AccountScope } from './scopes';

@Table({
	name: 'abc',
	permissions: ({ username }) => [
		[['CREATE', 'UPDATE', 'SELECT'], AccountScope.username === username],
		['DELETE', AdminScope]
	],
	auditable: true,
})
export class Account extends Model {
	@Field({ index: 'unique' })
	username?: string;

	@Field({ assert: 'email', name: 'email_address' })
	email!: string;

	@Field({
		name: 'pass',
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

	money?: Types.SDecimal;

	floatExample?: Types.SFloat;

	birthday?: Types.SDateTime;

	location?: Types.SGeoPoint;

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
		when: Types.SDateTime;
		verified?: boolean;
	}[];

	years_active?: number;

	@Index<Account>({ 
		columns: ['years_active', 'username'],
	})
	// rome-ignore lint/suspicious/noExplicitAny: <explanation>
	private idx_meta: any;
	private changeUsernameEvent = new SurrealEvent<Account>({
		name: 'change_username',
		when: ({ $after, $before, $event }) =>
			($before.username !== $after.username && $before.passKey !== $after.passKey && $event === 'CREATE') || $before.username !== $after.username,
		then: ({ $after, $before }) => '',
	});
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
// console.log('\n',
// 	Account.select()
// 		.where({ username: 'chiru'})
// 		.build()
// )

// // // Select all account records with IDs between the given range
// // // SELECT * FROM account:1..1000;
// console.log('\n',
// 	Account.select()
// 		.range([1, 1000])
// 		.build()
// )

// // Select all account records with IDs between the given range
// // SELECT * FROM account:['London', '2022-08-29T08:03:39']..['London', '2022-08-29T08:09:31'];
// console.log('\n',
// 	Account.select()
// 		.range([
// 			['London', '2022-08-29T08:03:39'],
// 			['London', '2022-08-29T08:09:31'],
// 		])
// 		.build()
// )

// // With Select (Select changes type?):
// // SELECT username, verified FROM account WHERE username = 'test';
// console.log('\n',
// 	Account.select(['username', 'verified'])
// 		.where({ username: 'chiru' })
// 		.build()
// );

// console.log('\n',
// 	Account.select(['username', 'verified'])
// 		.where({ username: 'chiru' })
// 		.count(
// 			Issue.select()
// 				.in(IssueLabel),
// 			'<', 5
// 		)
// 		.build()
// );

// console.log('\n',
// 	Account.select(['username', 'verified'])
// 		.where({ username: 'test' })
// 		.split('passKey')
// 		.orderBy('passKey', 'DESC', 'COLLATE')
// 		.groupBy()
// 		.parallel()
// 		.limit(5)
// 		.execute()
// );

// console.log('\n',
// 	Account.select()
// 		.select('*')
// 		.select(['username', 'passKey'])
// 		.select({
// 			$: 'birthday',
// 			as: 'dob'
// 		})
// 		.select({ $: ['birthday', '>=', '18'], as: 'date' })
// 		.select([
// 			{ $: ['username', '=', 'Arthur fleck'], as: 'joker' },
// 			{ $: ['birthday', '>=', '18'], as: 'date' }
// 		])
// 		.select([
// 			'*',
// 			{
// 				$$: 'tags.*.value',
// 				as: 'tags'
// 			}
// 		])
// 		.select([
// 			{
// 				$: 'username',
// 				where: 'active = true'
// 			}
// 		])
// 		.select([
// 			{
// 				$$: '->like->friend.name',
// 				as: 'farenheit'
// 			}
// 		])
// 		.select([
// 			{
// 				$$: '((celcius * 2) + 30)',
// 				as: 'farenheit'
// 			}
// 		])
// 		.select([
// 			{
// 				$$: {
// 					username: 'xD'
// 				},
// 				as: 'marketing_settings'
// 			}
// 		])
// 		.select([
// 			'*',
// 			{
// 				$$: sql(
// 					'SELECT * FROM events WHERE host == $parent.id',
// 					{ subquery: true }
// 				),
// 				as: 'self_hosted'
// 			}
// 		])
// 		.build()
// );

// console.log('\n',
// 	Account.select()
// 	.where({
// 		username: '',
// 		years_active: 8,
// 		verified: true,
// 		money: 40.51,
// 		birthday: {
// 			gt: new Date(),
// 		},
// 		metadata: {
// 			realAge: 18,
// 			issue: {
// 				$: {
// 					title: {
// 						contains: 'demo'
// 					},
// 					body: {
// 						endsWith: 'hello'
// 					}
// 				}
// 			}
// 		},
// 		logins: [{
// 			when: new Date(),
// 			verified: false
// 		}],
// 		OR: {
// 			birthday: new Date(),
// 			metadata: {
// 				realAge: 16,
// 				marketing: false,
// 			},
// 			OR: {
// 				money: 50000
// 			}
// 		}
// 	})
// 	.limit(10)
// 	.timeout('1m')
// 	.build()
// );

// Account.create({
// 	username: '',
// 	passKey: ''
// });

// console.log('\n',
// 	Account.delete()
// 		.where({
// 			username: {
// 				contains: 'chiru'
// 			}
// 		})
// 		.returnDiff()
// 		.timeout('1s')
// 		.parallel()
// 		.build()
// )

// console.log(
// 	Account.update()
// 		.where({
// 			username: 'chiru'
// 		})
// 		.merge({
// 			username: '',
// 			verified: true,
// 			logins: [{
// 				verified: true
// 			}],
// 		})
// 		.returnDiff()
// 		.parallel()
// 		.build()
// );

// new ModelSpec(Account)
// 	.canOperateWithPermission({
// 		scope: AdminScope,
// 		query: Account.select()
// 	});

/**
	With Maths:

	query(Temperature)
		.where({ celcius: math(celcius => celcius * 1.8) + 32 > 86.0 })

	query(Temperature)
		.where({ celcius: (celcius) => celcius * 1.8 + 32 > 86.0 })

	// SELECT * FROM temperature WHERE (celsius * 1.8) + 32 > 86.0;

	With nested arrays:

	query(Account)
		.where({ 'emails.*.active': true })

	// SELECT emails[WHERE active = true] FROM account;

	query(Account)
		.where({
			tags: {
				containsAny: ['tag1', 'tag2']
			}
		})

	// SELECT * FROM account WHERE tags CONTAINSANY ['tag1', 'tag2'];

	With regex:

	query(Account)
		.where({
			'emails.*.value': {
				regex: /gmail.com$/
			}
		})

	// SELECT * FROM person WHERE emails.*.value ?= /gmail.com$/;

	Select all person records (and their recipients), who have sent more than 5 emails

	Account.query({
		select: ['*'],
		where: {
			
		}
	})
		.select(['*'])
		.in(Sent)
		.in(Email)
		.in(To)
		.count(
			Email.query()
				.in(Sent),
			'>', 5
		)

	// SELECT *, ->sent->email->to->person FROM person WHERE count(->sent->email) > 5;

	Select other products purchased by people who purchased this laptop

	query(Product)
		.of(Purchased)
		.of(Person)
		.in(Purchased)
		.from('product:purchased');

	// SELECT <-purchased<-person->purchased->product FROM product:laptop;

	query(Product)
		.in(Purchased)
		.in(Product)
		.of(Purchased)
		.of(Person)
		.in(sql('purchased WHERE created_at > time::now() - 3w'))
		.from('person:chiru')

	// SELECT ->purchased->product<-purchased<-person->(purchased WHERE created_at > time::now() - 3w)->product FROM person:chiru;
 */

// const x = new Account();
// x.email = 'email@test.com';
// x.passKey = 'examplePassKey';
// await x.save();
