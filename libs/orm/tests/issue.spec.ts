import { DateTime, Field, Model, Scope, Table } from '../src';

import { Account } from './account.spec';
import { IssueLabel } from './issue_label.spec';
import { Project } from './project.spec';

import { AccountScope, AdminScope } from './scopes.spec';

@Table({
	permissions: ({ id }, { $auth }) => ({
		create: Scope(AdminScope) && id === $auth.id,
		delete: Scope(AdminScope),
		update: Scope(AdminScope) || Scope(AccountScope),
		select: Scope(AdminScope)
	})
})
export class Issue extends Model {
	@Field({ index: true })
	title?: string;

	body?: string;

	priority?: 'no_priority' | 'urgent' | 'high' | 'medium' | 'low';

	status?: 'backlog' | 'todo' | 'in_progress' | 'done' | 'canceled';

	due?: DateTime;

	labels?: IssueLabel[];

	project?: Project;

	parent?: Issue;

	assignee?: Account;

	creator?: Account;
}
