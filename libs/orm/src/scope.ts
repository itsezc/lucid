export type TScopeSessionTimeout = `${string}m` | `${string}h` | `${string}`;

export interface ISurrealScope<AuthContext, InputVars> {
	name: string;
	session: TScopeSessionTimeout;
	signin: (vars: InputVars) => string;
	signup: (vars: InputVars) => Promise<AuthContext>;
}

export type TScopeCtx = string;

export type TScopeAuthCtx<A, B> = Awaited<
	ReturnType<ISurrealScope<A, B>["signup"]>
>;

export function createScope<A, B>(
	props: ISurrealScope<A, B>,
): TScopeAuthCtx<A, B> {
	// @ts-ignore
	return props;
}
