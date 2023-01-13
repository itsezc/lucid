import { Field, Model, Table } from '..';
import { $admin } from './scopes.spec';

@Table({
	timestamps: true,
	permissions: {
		select: { scope: [$admin] },
		create: { scope: [$admin] },
		delete: { scope: [$admin] },
		update: { scope: [$admin] },
	}
})
export class Project extends Model {
	@Field()
	name?: string;
}
