import { Field, Model, Table } from '@surreal-tools/orm';
import { Account } from './account';

@Table()
export class Organization extends Model {
	name?: string;
}

@Table({ name: 'org_member_of' })
export class MemberOf extends Model {
	@Field({ name: 'in' })
	inside!: Account

	out!: Organization
}

@Table()
export class SubsidaryOf extends Model {
	@Field({ name: 'in' })
	inside!: Organization

	@Field<SubsidaryOf>({
		assert: ({ inside }, $value) => $value !== inside,
		permissions: ({ inside, out }) => ({
			select: inside !== out
		})
	})
	out!: Organization
}