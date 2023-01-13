import { ITable, SurrealRecord } from '.';
import { Model } from './model';

type ScopeSessionTimeout = `${string}m` | `${string}h`;

export type DefaultSessionVars = {
	$email: string;
	$pass: string;
};

export interface IScope<Vars = DefaultSessionVars> {
	name: string;
	timeout: ScopeSessionTimeout;
	table: typeof Model;
	signin: (vars: Vars) => {};
	siginup: (vars: Vars) => {};
}

export class Scope<Vars = DefaultSessionVars> implements IScope<Vars> {
	public name: string;
	public timeout: ScopeSessionTimeout;
	public table: typeof Model;

	public signin: (vars: Vars) => {};
	public siginup: (vars: Vars) => {};
}
