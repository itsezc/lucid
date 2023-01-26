import { relate } from '@surreal-tools/orm';

import { Issue } from './issue';
import { Account } from './account';
import { IssueLabel } from './issue_label';

const acc = new Account()
acc.id = '1';

const issue = new Issue()
issue.id = '2';

// NEW: Builder API
console.log(
	relate(IssueLabel)
		.in(acc)
		.out(issue)
		.content({ 
			name: '',
			label: ''
		})
		.returnDiff()
		.timeout('1s')
		.build()
)