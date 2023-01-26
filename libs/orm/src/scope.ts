import { Model } from './model';

export type TScopeSessionTimeout = `${string}m` | `${string}h`;

export type DefaultSessionVars = {
	$email: string;
	$pass: string;
};

export interface ISurrealScope<AuthContext extends Model = Model, Vars = DefaultSessionVars> {
	name: string;
	timeout: TScopeSessionTimeout;
	signin: (vars: Vars) => AuthContext;
	siginup: (vars: Vars) => AuthContext;
}