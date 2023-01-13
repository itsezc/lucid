import { Table, Model, Field } from "../src";
import { Account } from "./account.spec";

@Table()
export class Organization extends Model {
	@Field()
	name?: string;

	@Field({
		type: 'record',
		record: Account
	})
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

	@Field({ type: 'datetime' })
	joinDate?: Date;
}

let foretag = new Organization();
