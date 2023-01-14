import { Model, TModelProperties } from './';

export type QueryBuilder<SubModel extends Model> = {
	select: (
		fields: (keyof TModelProperties<SubModel>)[],
	) => QueryBuilder<SubModel>;

	range: () => QueryBuilder<SubModel>;

	through: (through: typeof Model) => QueryBuilder<SubModel>;

	in: (through: typeof Model) => QueryBuilder<SubModel>;

	of: (through: typeof Model) => QueryBuilder<SubModel>;

	from: (id: string) => QueryBuilder<SubModel>;

	build: () => string;

	execute: () => void;

	live: () => void;
};

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

	query(Account)
		.through(Sent)
		.in(Email)
		.in(To)
		.where()
		.count()
		.through(Sent)
		.in(Email)
		.gt(5)

	// SELECT *, ->sent->email->to->person FROM person WHERE count(->sent->email) > 5;

	Select other products purchased by people who purchased this laptop

	query(Product)
		.over(Purchased)
		.of(Person)
		.in(Purchased)
		.from('product:purchased');

	// SELECT <-purchased<-person->purchased->product FROM product:laptop;

	query(Product)
		.through(Purchased)
		.in(Product)
		.of(Purchased)
		.of(Person)
		.in(sql('purchased WHERE created_at > time::now() - 3w'))
		.from('person:chiru')

	// SELECT ->purchased->product<-purchased<-person->(purchased WHERE created_at > time::now() - 3w)->product FROM person:chiru;
 */
