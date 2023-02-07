import { SurrealRest } from '../src/client.rest';
import { describe, it, test, expect } from 'bun:test';

describe('REST Client', () => {
	test('root', () => {
		const rootUser = new SurrealRest('http://localhost:8000', {
			user: 'root',
			pass: 'root',
		});

		rootUser.query('INFO FOR DB');
	});
});