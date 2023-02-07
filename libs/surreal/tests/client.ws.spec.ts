import { SurrealWS } from '../src/client.ws';
import { describe, test, expect } from 'bun:test';

describe('WS Client - Root', () => {
	const rootUser = new SurrealWS('http://localhost:8000', {
		user: 'root',
		pass: 'root',
	});

	test('Connects to Surreal', () => {
		expect(rootUser.isConnected).toBe(true);
		rootUser.query('INFO FOR DB');
	});
});
