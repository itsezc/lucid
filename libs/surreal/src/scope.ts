export type TScopeSessionTimeout = `${string}m` | `${string}h` | `${string}`;

export interface ISurrealScope<AuthContext, InputVars> {
	name: string;
	session: TScopeSessionTimeout;
	signin: (vars: InputVars) => string;
	signup: (vars: InputVars) => Promise<AuthContext>;
}

export type TScopeAuthCtx<A, B> = Awaited<
	ReturnType<ISurrealScope<A, B>["signup"]>
>;
