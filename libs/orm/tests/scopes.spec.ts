import { Account } from './account.spec';
import { DefaultSessionVars, IScope, Scope } from '../src/scope';

export class AccountScope<Vars = DefaultSessionVars> implements IScope<Vars> {
	name = 'account';
	timeout: `${string}m` | `${string}h` = '15m';
	table = Account;
	signin: (vars: Vars) => {};
	siginup: (vars: Vars) => {};
}

export class AdminScope<Vars = DefaultSessionVars> implements IScope<Vars> {
	name: 'admin';
	timeout: `${string}m` | `${string}h` = '15m';
	table = Account;
	signin: (vars: Vars) => {};
	siginup: (vars: Vars) => {};
}
