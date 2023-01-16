import { Scope, Model, Table } from '@surreal-tools/orm';
import { AdminScope } from './scopes';

@Table({
	// permissions: () => [[['CREATE', 'UPDATE', 'DELETE'], false]]
})
export class Project extends Model {
	name?: string;
}