import { DateTime, Field, Model, Table } from '../src';

import { Account } from './account.spec';
import { IssueLabel } from './issue_label.spec';
import { Project } from './project.spec';

import { AccountScope, AdminScope } from './scopes.spec';

@Table({
	permissions: {
		create: { scope: [AdminScope] },
		delete: { scope: [AdminScope] },
		update: { scope: [AdminScope, AccountScope] },
		select: { scope: [AdminScope] }
	}
})
export class Issue extends Model {
	@Field({ index: true })
	title?: string;

	@Field()
	body?: string;

	@Field()
	priority?: 'no_priority' | 'urgent' | 'high' | 'medium' | 'low';

	@Field()
	status?: 'backlog' | 'todo' | 'in_progress' | 'done' | 'canceled';

	@Field()
	due?: DateTime;

	@Field()
	labels?: IssueLabel[];

	@Field()
	project?: Project;

	@Field()
	parent?: Issue;

	@Field()
	assignee?: Account;

	@Field()
	creator?: Account;
}
