import { relate } from '@surreal-tools/orm';

import { Issue } from './issue';
import { Account } from './account';
import { IssueLabel } from './issue_label';

// NEW: Builder API
relate(IssueLabel)
	.in(new Account())
	.out(new Issue())
	.content({ 
		name: '',
		label: ''
	})
	.return('DIFF')
	.timeout('1s');