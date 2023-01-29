import { SurrealRest } from '../src/client.rest';
import { describe, it, test, expect } from 'bun:test';

describe('REST Client', () => {
	const dbClient = new SurrealRest('abc', {
        NS: 'abc',
        DB: 'xyz'
    });

})