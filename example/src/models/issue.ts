import { type Types, Field, Model, Table, Functions } from '@lucid-framework/orm';

import { Account } from './account';
import { IssueLabel } from './issue_label';
import { Project } from './project';

import { AccountScope, AdminScope } from './scopes';

const { SArray } = Functions;

@Table({
	name: 'issue',
	permissions: ({ id, title, labels }, { $auth }) => ({
		create: AccountScope && Functions.count(SArray.intersect(labels, ['admin', 'manager'])) > 0,
		delete: 'id == $auth.id',
		update: AdminScope || (AccountScope.id  === id || AdminScope.id === id),
		select: AdminScope || (id == $auth.id && title != null && (AdminScope) && AccountScope)
	}),
})
export class Issue extends Model {
	@Field({ index: true })
	title: string = 'New issue';

	body!: string;

	priority!: 'no_priority' | 'urgent' | 'high' | 'medium' | 'low';

	status: 'backlog' | 'todo' | 'in_progress' | 'done' | 'canceled' = 'backlog';

	due?: Types.SDateTime;

	labels?: IssueLabel[];

	project?: Project;

	parent?: Issue;

	assignee?: Account;

	creator?: Account;

	tags?: string[];
	tags2?: number[];
	tags3?: boolean[];

	points?: Types.SGeoPoint[];
}
