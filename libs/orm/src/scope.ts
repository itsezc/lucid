import { Model } from './model';

export type TScopeSessionTimeout = `${string}m` | `${string}h`;

export type DefaultSessionVars = {
	$email: string;
	$pass: string;
};

export interface ISurrealScope<Vars = DefaultSessionVars> {
	name: string;
	timeout: TScopeSessionTimeout;
	table: typeof Model;
	signin: (vars: Vars) => void;
	siginup: (vars: Vars) => void;
}

export const Scope = (scope: ISurrealScope) => {
	return `$scope === ${scope}`;
};
