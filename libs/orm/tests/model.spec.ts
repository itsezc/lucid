import { describe, it, expect } from 'bun:test';
import { Model, Table, Field, type Types } from '@/src/index';

@Table()
class Account extends Model {
	username?: string;
	password?: string;
	birthday?: Types.SDateTime;
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
