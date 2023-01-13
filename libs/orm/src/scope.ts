import { Account } from './tests/account.spec';
import { Model } from './model';

type ScopeSessionTimeout = `${string}m` | `${string}h`;

type DefaultSessionVars = {
	$email: string;
	$pass: string;
};

interface IScope<Vars = DefaultSessionVars> {
	name: string;
	timeout: ScopeSessionTimeout;
	table: typeof Model;
	signin: (vars: Vars) => {};
	// siginup: {};
}

export class Scope<Vars = DefaultSessionVars> {
	constructor(public props: IScope<Vars>) {}
}
