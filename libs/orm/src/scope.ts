import { Model } from './model';

export type ScopeSessionTimeout = `${string}m` | `${string}h`;

export type DefaultSessionVars = {
	$email: string;
	$pass: string;
};

export interface ISurrealScope<Vars = DefaultSessionVars> {
	name: string;
	timeout: ScopeSessionTimeout;
	table: typeof Model;
	signin: (vars: Vars) => {};
	siginup: (vars: Vars) => {};
}
