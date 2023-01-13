import { Account } from './account.spec';
import { DefaultSessionVars, IScope, ScopeSessionTimeout } from '../src/scope';

export class AccountScope<Vars = DefaultSessionVars> implements IScope<Vars> {
	name = 'account';
	timeout: ScopeSessionTimeout = '15m';
	table = Account;
	signin: (vars: Vars) => {};
	siginup: (vars: Vars) => {};
}

export class AdminScope<Vars = DefaultSessionVars> implements IScope<Vars> {
	name: 'admin';
	timeout: ScopeSessionTimeout = '15m';
	table = Account;
	signin: (vars: Vars) => {};
	siginup: (vars: Vars) => {};
}
