import { DateTime, Field, Model, Table } from '@surreal-tools/orm';

import { Account } from './account';
import { IssueLabel } from './issue_label';
import { Project } from './project';

import { AccountScope, AdminScope } from './scopes';

@Table<Issue>({
	permissions: ({ id, title }, { $auth }) => ({
		create: AccountScope && id === $auth.id,
		delete: 'id === $auth.id',
		update: AdminScope || (AccountScope && id === $auth.id || AdminScope && id === $auth.id),
		select: AdminScope || (id == $auth.id && title != null && (AdminScope) && AccountScope)
	}),
})
export class Issue extends Model {
	@Field({ index: true })
	title!: string;

	body!: string;

	//TODO: allow default values without
	priority!: 'no_priority' | 'urgent' | 'high' | 'medium' | 'low';

	status!: 'backlog' | 'todo' | 'in_progress' | 'done' | 'canceled';

	due?: DateTime;

	labels?: IssueLabel[];

	project?: Project;

	parent?: Issue;

	assignee?: Account;

	creator?: Account;
}