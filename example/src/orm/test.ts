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
	await User.createMany([
		{
			username: 'test',
			email: 'someemail',
			password: 'pass',
			posts: [await Post.create({ title: 'test', content: 'test' })],
		},
		{
			username: 'test2',
			email: 'someemail2',
			password: 'pass2',
		},
	]);

	const user = await User.select(['id', 'username', 'posts']).execute();
	console.log(user);
})();
