import { Lucid } from '@surreal-tools/orm';
import { SurrealRest, SurrealWS } from '@surreal-tools/client';
import { User, Post } from '../models/user';
// import { AccountScope } from '../models/scopes';

Lucid.init(
	new SurrealWS('http://localhost:8000', {
		NS: 'ttest',
		DB: 'ttest',
		user: 'root',
		pass: 'root',
	}),
);

(async () => {
	// const createRes = await User.createMany([
	// 	{
	// 		username: 'test',
	// 		email: 'someemail',
	// 		password: 'pass',
	// 		interests: ['test', 'test2'],
	// 		bestFriend: await User.create({
	// 			username: 'test3',
	// 			password: 'pass3',
	// 		}),
	// 		posts: [await Post.create({ title: 'test', content: 'test' })],
	// 	},
	// 	{
	// 		username: 'test2',
	// 		email: 'someemail2',
	// 		password: 'pass2',
	// 		posts: await Post.createMany([
	// 			{ title: 'test2', content: 'test2' },
	// 			{ title: 'test3', content: 'test3' },
	// 		]),
	// 	},
	// ]);

	// console.log(createRes);

	// const setRes = await User.set('password', 'password').set('email', 'email').set('username', 'username').save();

	// const res = await User.delete().where({ username: 'test' }).execute();
	// console.log(res, 'DELETIONS');
	// console.log(setRes);

	// console.log(setRes);

	// const singleUpdate = await User.update('user:sd').set('username', 'new').execute();

	// const updatedUser = await User.update()
	// 	.where({ username: 'test2' })
	// 	.content({
	// 		username: 'test2',
	// 		password: 'pass2',
	// 	})
	// 	.execute();

	// console.log(updatedUser);
	// console.log(singleUpdate);
	const rele = await User.select(['bestFriend', 'email', Post.count('comments').as('posts_count')]).execute();

	const rel = await User.select(['posts', { count: 'email' }])
		.fetch(['posts'])
		.execute();

	const res = await User.select(['bestFriend', 'email', 'posts'])
		.fetch(['bestFriend'])
		.groupBy('bestFriend', 'email') //todo add type def to check selections
		.orderBy('bestFriend', 'ASC')
		.execute();

	console.log(res);
	process.exit(0);
})();

/**
 *
 * count(SELECT * FROM post)
 * User.select(['username', 'email', Lucid.count(Post.select(['title'])).as('postCount)])
 *
 * User.select(['username', 'email', Post.count().as('postCount)])
 * Lucid.query().from("User").select(['username', 'email', Post.count().as('postCount')])
 * User.select(['orders']).where({ orders: count() }).execute()
 *
 * User.count().as('userCount')
 * vs
 * Lucid.count(User).as('userCount')
 * vs
 * User.count({ as: 'userCount' })
 * vs
 * User.select([{ count: '*', as: 'userCount' }, { sum: 'age' }, 'gender', 'country']).groupBy(['gender', 'country'])
 */
