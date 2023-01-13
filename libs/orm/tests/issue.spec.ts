import { Field, Model, Table } from '../src';

import { Account } from './account.spec';
import { IssueLabel } from './issue_label.spec';
import { Project } from './project.spec';

import { $account, $admin } from './scopes.spec';

@Table({
	permissions: {
		create: { scope: [$admin] },
		delete: { scope: [$admin] },
		update: { scope: [$admin, $account] },
		select: { scope: [$admin] }
	}
})
export class Issue extends Model {
	@Field({ index: true })
	title?: string;

	@Field()
	body?: string;

	@Field({
		type: 'enum',
		enum: [
			'no_priority',
			'urgent',
			'high',
			'medium',
			'low'
		]
	})
	priority?: string;

	@Field({
		type: 'enum',
		enum: [
			'backlog',
			'todo',
			'in_progress',
			'done',
			'canceled'
		]
	})
	status?: string;

	@Field({ type: 'datetime' })
	due?: Date;

	@Field({ type: 'array', array: IssueLabel })
	labels?: IssueLabel[];

	@Field({ type: 'record', record: Project })
	project?: Project;

	@Field({ type: 'record', record: Issue })
	parent?: Issue;

	@Field({ type: 'record', record: Account })
	assignee?: Account;

	@Field({ type: 'record', record: Account })
	creator?: Account;
}



Issue.query({ where: { } });