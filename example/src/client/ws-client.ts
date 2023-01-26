import { type TDefaultSessionVars } from '@surreal-tools/orm';
import SurrealWS from '@surreal-tools/client/src/client.ws';
import { AccountScope } from '../models/scopes';

const client = new SurrealWS(
	'http://localhost:8000',
    'test',
    'test',
    'account'
);

(async() => {
	await client.signin<TDefaultSessionVars>({ 
		$email: 'chiru', 
		$pass: 'hi'
	});

	// await client.signup<TDefaultSessionVars>({ 
	// 	$email: 'chiru', 
	// 	$pass: 'hi'
	// });

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

