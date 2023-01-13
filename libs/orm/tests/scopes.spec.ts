import { Account } from './account.spec';
import {
	DefaultSessionVars,
	ISurrealScope,
	ScopeSessionTimeout,
} from '../src/scope';

export class AccountScope<Vars = DefaultSessionVars>
	implements ISurrealScope<Vars>
{
	name = 'account';
	timeout: ScopeSessionTimeout = '15m';
	table = Account;
	signin: (vars: Vars) => {};
	siginup: (vars: Vars) => {};
}

export class AdminScope<Vars = DefaultSessionVars>
	implements ISurrealScope<Vars>
{
	name: 'admin';
	timeout: ScopeSessionTimeout = '15m';
	table = Account;
	signin: (vars: Vars) => {};
	siginup: (vars: Vars) => {};
}
