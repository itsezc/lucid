import { Table, Model, Field } from "../src";

import { Issue } from "./issue.spec";

@Table({ edge: true })
export class IssueBlocks extends Model {
	@Field<IssueBlocks>({
		name: 'in',
		assert: ({ out }, value) => value !== out,
	})
	inside?: Issue;

	@Field<IssueBlocks>({
		assert: ({ inside }, value) => value !== inside,
	})
	out?: Issue;
}

let x = new IssueBlocks();
