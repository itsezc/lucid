import { Table, Model, Field, Types } from '@surreal-tools/orm';
import { AdminScope } from './scopes';

@Table({ name: 'follows', edge: true })
export class Followers extends Model {
	@Field({ name: 'out' })
	inside!: User;
	out!: User;
}

@Table({ name: 'follows', edge: true })
export class Following extends Model {
	@Field({ name: 'in' })
	inside!: User;
	out!: User;
}

@Table<User>({
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

	bestFriend?: User;

	// @FieldRelation({ direction: "OUT" })
	followers?: Followers[];

	// @FieldRelation({ direction: "IN" })
	following?: Following[];
}

@Table<Portfolio>({
	name: 'portfolio',
	auditable: true,
})
export class Portfolio extends Model {
	name?: string;
	owner?: User;
	trades?: Trade[];
}

@Table<Trade>({
	name: 'trade',
})
export class Trade extends Model {
	portfolio?: Portfolio;
	asset: string;
	quantity?: Types.SFloat;
	avgPrice?: Types.SDecimal;
	price?: Types.SDecimal;
	tradeDate?: Types.SDateTime;
}

@Table<Post>({
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

@Table<Comment>({
  name: 'comment',
  auditable: true,
})
export class Comment extends Model {
	content?: string;
	children?: Comment[];
}

const user = await User.select(['username', 'email', 'posts'])
	.select({
		$: 'posts',
		as: 'posting',
	})
	.count(Post.select(['comments']), { as: 'postCount', '<=': 12 })
	.build();

console.log(user);

/*
@Table({ name: 'follows', edge: true })
export class Followers extends Model {
	@Field({ name: 'in' })
	inside!: User;
	out!: User;
}

@Table({ name: 'follows', edge: true })
export class Following extends Model {
	@Field({ name: 'out' })
	inside!: User;
	out!: User;
}

@Table<User>({
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
	bestFriend?: User;
	followers?: Followers[];
	following?: Following[];
}

being able to select, relational fields via the select method
eg. User.select(['username', 'followers', 'following']).build()
SELECT username, <-follows<-user as followers, ->follows->user as following FROM user
also to be able to fetch relational fields via the fetch method
eg. User.select(['username', 'followers', 'following']).fetch(['followers', 'following']).build();
SELECT username, <-follows<-user as followers, ->follows->user as following FROM user FETCH followers, following
there are several issues which need to be addressed
1. the schema generator must know how to handle the relational fields (i.e do not mistake them for record fields)
2. the select builder must also know how to differentiate between relational and record fields

one solution could be to create a new decorator called @Relational
this decorator would be used to decorate the relational fields
@Relational(Followers) (could also potentially add more props to this decorator)
the schema generator would then know to ignore these fields
the select builder would also know to ignore these fields

another solution could be to add a new property to the @Field decorator
eg. @Field({ relation: Followers })

a third solution could be to expand the current select method to accept an instance of a select builder
eg. User.select(['username')]).select(Followers.select())
or expand the in, out logic to handle the relational query
*/
