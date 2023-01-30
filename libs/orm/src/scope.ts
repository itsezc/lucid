export type TScopeSessionTimeout = `${string}m` | `${string}h` | `${string}`;

export type TDefaultSessionVars = {
	$email: string;
	$pass: string;
};

export interface ISurrealScope<AuthContext, Vars = TDefaultSessionVars> {
	name: string;
	session: TScopeSessionTimeout;
	signin: (vars: Vars) => string;
	signup: (vars: Vars) => Promise<AuthContext>;
}

