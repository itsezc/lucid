import { type TDefaultSessionVars } from '@surreal-tools/orm';
import SurrealWS from '@surreal-tools/client/src/client.ws';
import { AccountScope } from './scopes';

const client = new SurrealWS(
	'http://localhost:8000',
    'test',
    'test',
    'account'
);

(async() => {
	await client.connect();
	await client.signin<TDefaultSessionVars, {}>({ 
		$email: 'abc', 
		$pass: 'xyz'
	});
	console.log(client.token);
})();

// (async () => {
	// await client.signin<TDefaultSessionVars, {}>({ 
	// 	$email: 'abc', 
	// 	$pass: 'xyz'
	// });

// 	await client.signup<TDefaultSessionVars, {}>({ 
// 		$email: 'abc2', 
// 		$pass: 'xyz'
// 	});
// })();

