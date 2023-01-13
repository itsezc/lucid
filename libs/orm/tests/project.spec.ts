import { Field, Model, Table } from '../src';
import { AdminScope } from './scopes.spec';

@Table({
	permissions: {
		select: { scope: [AdminScope] },
		create: { scope: [AdminScope] },
		delete: { scope: [AdminScope] },
		update: { scope: [AdminScope] },
	}
})
export class Project extends Model {
	@Field()
	name?: string;
}
