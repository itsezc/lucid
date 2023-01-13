import { Table, Model, Field } from '../';
import { $admin } from './scopes.spec';

@Table<Account>({
	permissions: {
		create: { scope: [$admin] },
		delete: false,
		select: { auth: ['id', 'id'] },
		update: { auth: ['id', 'id'] }
	},
	auditable: true,
})
export class Account extends Model {
	@Field({ index: 'unique' })
	username?: string;

	@Field({
		permissions: {
			create: false,
			select: false,
			delete: false,
			update: { auth: ['id', 'id'] }
		}
	})
	password?: string;

	@Field()
	passKey?: string;

	@Field({ type: 'bool' })
	verified?: boolean;

	@Field({ type: 'int' })
	years_active?: number;
}
