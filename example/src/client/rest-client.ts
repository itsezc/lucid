import { SurrealRest } from '@lucid-framework/client';

const client = new SurrealRest('http://localhost:8000', {
	user: 'root',
	pass: 'root',
});

console.log(await client.query('INFO FOR NS'));
