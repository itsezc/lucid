import { Field, Model, Table } from '@lucid-framework/orm';

@Table()
export class IssueLabel extends Model<true> {
	name!: string;
	label!: string;
}
