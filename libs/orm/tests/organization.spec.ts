import { Table, Model, Field, DateTime } from '../src';
import { Account } from './account.spec';

@Table()
export class Organization extends Model {
	name?: string;

	createdBy?: Account;
}

@Table({ edge: true })
export class MemberOf extends Model {
	@Field<MemberOf>({
		name: 'in',
		assert: ({ out }, value) => value !== out
	})
	inside?: Account;

	@Field<MemberOf>({
		assert: ({ inside }, value) => value !== inside
	})
	out?: Organization;

	joinDate?: DateTime;
}

let foretag = new Organization();
