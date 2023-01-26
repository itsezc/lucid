import { ISurrealScope, Model, Table } from '@surreal-tools/orm';
import ISurrealConnector from './client.interface';

type TSurrealResponse<T> = {
    result: T[],
    error: {}[],
};

type ExtractVars<T extends ISurrealScope<unknown>> = T extends ISurrealScope<infer V> ? Partial<V> : never;

export default class SurrealRest implements ISurrealConnector 
{
    constructor(
        public host: string,
        private token: string,
        private NS: string,
        private DB: string,
        private SC: string,
    ) {}

    //Using a token must be done within the query method since this connector is stateless.
    async query<T>(query: string): Promise<T[]> {
        const res = await fetch(`${this.host}/sql`, {
            headers: {
                NS: this.NS,
                DB: this.DB,
                Accept: 'application/json',
                Authorization: `Bearer ${this.token}`
            },
            body: query
        }) as unknown as TSurrealResponse<T>;

        return res.result;
    }


    async signin<S extends ISurrealScope<unknown>>(args: ExtractVars<S>): Promise<boolean> {
        const res = await fetch(`${this.host}/signin`, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                NS: this.NS,
                DB: this.DB,
            },
            body: JSON.stringify({
                NS: this.NS,
                DB: this.DB,
                SC: this.SC,
                username: 'abc',
                password: 'def',
                ...args
            })
        });

        return false;
    }

    async signup<S>(args: S | { user?: string | undefined; pass?: string | undefined; DB?: string | undefined; NS?: string | undefined; }): Promise<boolean> {
        return false;
    }

}

