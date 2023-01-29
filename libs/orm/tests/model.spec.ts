import { describe, it, expect } from 'bun:test';
import { Model, Table, Field, DateTime } from '@/src/index';

@Table()
class Account extends Model {
	username?: string;
	password?: string;
	birthday?: DateTime;
}

describe('Model', () => {
	it('Account can be queried', () => {
		expect(
			Account.select()
				.where({
					username: 'chiru'
				})
				.build()
		).toBe("SELECT * FROM account WHERE username = 'chiru';")
	});
});
