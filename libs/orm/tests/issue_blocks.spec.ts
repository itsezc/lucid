import { Table, Model, Field } from '../src';

import { Issue } from './issue.spec';

@Table({ edge: true })
export class IssueBlocks extends Model {
	@Field<IssueBlocks>({
		name: 'in',
		assert: ({ out }, value) => value !== out,
		type: 'record',
		record: Issue
	})
	inside?: Issue;

	@Field<IssueBlocks>({
		assert: ({ inside }, value) => value !== inside,
		type: 'record',
		record: Issue
	})
	out?: Issue;
}

let x = new IssueBlocks();
