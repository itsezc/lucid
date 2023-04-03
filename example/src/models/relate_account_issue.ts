import { relate } from "@lucid-framework/orm";

import { Issue } from "./issue.js";
import { Account } from "./account.js";
import { IssueLabel } from "./issue_label.js";

const acc = new Account();
acc.id = "1";

const issue = new Issue();
issue.id = "2";

// NEW: Builder API
// console.log(
// 	relate(IssueLabel)
// 		.in(acc)
// 		.out(issue)
// 		.content({
// 			name: '',
// 			label: '',
// 		})
// 		.returnDiff()
// 		.timeout('1s')
// 		.build(),
// );
