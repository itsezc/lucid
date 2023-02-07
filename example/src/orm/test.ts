import { Lucid } from '@surreal-tools/orm';
import { SurrealRest, SurrealWS } from '@lucid-framework/surreal';

import { Account } from '../models/account';
import { AccountScope } from '../models/scopes';

Lucid.init(
	new SurrealWS('http://localhost:8000', {
		NS: 'test',
		DB: 'test',
	}),
);

(async () => {
	console.log(await Lucid.client()?.query('INFO FOR NS'));

	// console.log(
	// 	await Account.select()
	// 		.where({ username: 'xyz' })
	// 		.execute()
	// );
})();
