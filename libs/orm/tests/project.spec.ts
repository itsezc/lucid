import { Scope, Model, Table } from '../src';
import { AdminScope } from './scopes.spec';

@Table({
	permissions: () => ({
		select: Scope(AdminScope),
		create: Scope(AdminScope),
		delete: Scope(AdminScope),
		update: Scope(AdminScope),
	})
})
export class Project extends Model {
	name?: string;
}
