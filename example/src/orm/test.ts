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
	// console.log(await Lucid.client()?.query('INFO FOR NS'));
	// const post = await Post.create({ title: 'test', content: 'test' });

	// console.log(post);

	// await User.create({
	// 	username: 'test',
	// 	email: 'someemail',
	// 	password: 'pass',
	// 	posts: [post.id], //todo: would it be better to pass the whole post model and let the ORM handle it?
	// });

	const user = await User.select(['id', 'username', 'posts']);
	// .count('posts', '>', 1, 'post_count')
	// .count(Post.select(['comments']), '>', 1, 'comment_count');
	// .where({
	// 	username: 'test',
	// 	posts: {
	// 		$: {
	// 			title: {
	// 				contains: 'test',
	// 			},
	// 		},
	// 	},
	// })
	// .count('post_count', '>', 1, 'post_counts')
	// .countV2({
	// 	posts: {
	// 		'<=': 32,
	// 		as: 'post_counts',
	// 	},
	// });
	// .execute();
	// console.log(user[0].post_counts);
})();

//should be able to do
// new User({username: 'test', email: 'email'}).save()
