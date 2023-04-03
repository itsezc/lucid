import { Lucid } from "@lucid-framework/orm";
import { SurrealRest } from "@lucid-framework/client";
import { Session, User, Account } from "../models/user.js";
import { Hello } from "../models/hello.js";

Lucid.init(
	new SurrealRest("http://localhost:8000", {
		NS: "ttest",
		DB: "ttest",
		user: "root",
		pass: "root",
	}),
);

// const setQ = Hello.set("id", "test2").set("age", 12).set("test", "Two").set("dateAt", new Date()).set("name", "test2").set("isAlive", false).save();

const h = await Hello.select(["age", "dateAt"]).groupBy("age", "dateAt").orderBy("age", "ASC").orderBy("dateAt", "ASC").execute();
console.log(h);

process.exit(0);

const el = await Account.select(["user", "providerAccountId", "provider"])
	.where({
		providerAccountId: undefined,
		provider: "web3",
		accessToken: "undefined",
	})
	.execute();

console.log(el);
process.exit(0);
const relex = await User.select([{ key: "sessions", as: "lol" }])
	.where({
		username: {
			contains: "test",
		},
		OR: [
			{
				email: "sda",
			},
		],
	})
	.build();

process.exit(0);

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
	// const rel = await User.select(['posts', { count: 'email' }])
	// 	.fetch(['posts'])
	// 	.execute();
	// const res = await User.select(['bestFriend', 'email', 'posts'])
	// 	.fetch(['bestFriend'])
	// 	.groupBy('bestFriend', 'email') //todo add type def to check selections
	// 	.orderBy('bestFriend', 'ASC')
	// 	.execute();
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
