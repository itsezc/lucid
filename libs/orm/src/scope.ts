import { Model } from './model';

export type TScopeSessionTimeout = `${string}m` | `${string}h` | `${string}`;

export type TDefaultSessionVars = {
	$email: string;
	$pass: string;
};

export interface ISurrealScope<AuthContext, Vars = TDefaultSessionVars> {
	name: string;
	timeout: TScopeSessionTimeout;
	signin: (vars: Vars) => AuthContext;
	signup: (vars: Vars) => AuthContext;
}

