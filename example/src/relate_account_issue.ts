import { relate2, relate } from '@surreal-tools/orm';

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

// Current API
relate2({
	in: new Account(),
	out: new Issue(),
	through: IssueLabel,
	content: {
		name: '',
		label: ''
	},
	return: 'DIFF',
	timeout: '1s'
});

