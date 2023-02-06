import { Table, Model, Field, Types, FieldRelation } from '@surreal-tools/orm';
import { AdminScope } from './scopes';
import 'reflect-metadata';

@Table({ name: "follows", edge: true })
export class Followers extends Model {
	@Field({ name: 'out' })
	inside!: User;
	out!: User;
}

@Table({ name: "follows", permissions: ({ inside }) => [[['CREATE', 'UPDATE', 'SELECT'], true], ['DELETE', AdminScope]], edge: true})
export class Following extends Model {
	@Field({ name: 'in' })
	inside!: User;
	out!: User;
}

@Table({
	name: 'user',
	permissions: ({ username }) => [
		[['CREATE', 'UPDATE', 'SELECT'], true],
		['DELETE', AdminScope]
	],
	auditable: true,
})
export class User extends Model {
	@Field({ index: 'unique' })
	username: string;

	@Field({ assert: 'email', name: 'email_address', index: "unique" })
	email?: string;

	password: string;

	interests?: string[];

	@Field({ name: 'posts' })
	posts?: Post[];

	portfolios?: Portfolio[];

	nested?: {
		foo: string;
		posting?: Post;
		items?: User[];
	};

	bestFriend?: User;

	@FieldRelation({ model: Followers, direction: "OUT" })
	followers?: Followers;

	@FieldRelation({ model: Following, direction: "IN" })
	following?: Following;
}

@Table({
	name: 'portfolio',
	auditable: true,
})
export class Portfolio extends Model {
	name?: string;
	owner?: User;
	trades?: Trade[];
}

@Table({name: "trade"})
export class Trade extends Model {
	portfolio?: Portfolio;
	asset: string;
	quantity?: Types.SFloat;
	avgPrice?: Types.SDecimal;
	price?: Types.SDecimal;
	tradeDate?: Types.SDateTime;
}

@Table({
	name: 'post',
  auditable: true,
})
export class Post extends Model {
	@Field({ index: 'unique' })
	title?: string;
	content?: string;
	author?: User;
	comments?: Comment[];
}

@Table({
	name: 'comment',
  auditable: true,
})
export class Comment extends Model {
	content?: string;
	children?: Comment[];
}
