import { Scope, Model, Table } from '@surreal-tools/orm';
import { AdminScope } from './scopes';

@Table({ name: 'abc'})
export class Project extends Model {
	name?: string;
}