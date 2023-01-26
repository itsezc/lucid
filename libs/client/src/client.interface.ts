import { ISurrealScope, TDefaultSessionVars } from "@surreal-tools/orm";

export type TExtractVars<T extends ISurrealScope<unknown>> = T extends ISurrealScope<infer V> ? Partial<V> : never;
export interface ISurrealConnector {
    query<T>(query: string): Promise<Array<T>>;

    //Promise<TExtractVars<S>>;
    //Use that to match return type.
    
    signin<S extends ISurrealScope<unknown, TDefaultSessionVars>>(args: TSurrealAuthArgs | S): void;
    signup<S extends ISurrealScope<unknown, TDefaultSessionVars>>(args: TSurrealAuthArgs | S): void;
}

type TSurrealAuthArgs = {
    user?: string;
    pass?: string;
    DB?: string;
    NS?: string;
}

export type TAuthSuccessResponse = {
    code: 200;
    details: string;
    token: string;
}

export type TAuthErrorResponse = {
    code: 403;
    details: string;
    description: string;
    information: string;
}