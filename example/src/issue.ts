import { DateTime, Field, Model, Scope, Table } from '@surreal-tools/orm';

import { Account } from './account';
import { IssueLabel } from './issue_label';
import { Project } from './project';

import { AccountScope, AdminScope } from './scopes';

@Table({
	permissions: ({ id }, { $auth }) => ({
		create: AdminScope && id === $auth.id,
		delete: false,
		update: AdminScope || AccountScope,
		select: AdminScope
	}),
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