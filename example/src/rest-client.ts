import { type TDefaultSessionVars } from '@surreal-tools/orm';
import SurrealRest from '@surreal-tools/client/src/client.rest';
import { AccountScope } from './scopes';

const client = new SurrealRest(
	'http://localhost:8000',
    'test',
    'test',
    'account'
);

// (async () => {
// 	await client.signin<TDefaultSessionVars, {}>({ 
// 		$email: 'abc', 
// 		$pass: 'xyz'
// 	});

// 	await client.signup<TDefaultSessionVars, {}>({ 
// 		$email: 'abc2', 
// 		$pass: 'xyz'
// 	});
// })();

