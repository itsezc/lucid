
import { ISurrealScope, Model, Table } from '@surreal-tools/orm';
import ISurrealConnector from './client.interface';

type TSurrealResponse<T> = {
    result: T[],
    error: {}[],
};

type ExtractVars<T extends ISurrealScope> = T extends ISurrealScope<infer Vars> ? Vars : never;

class Account extends Model {}

type ScopeType = { $username: string; $passKey: string; };

const AccountScope: ISurrealScope<ScopeType> = {
    name: 'account',
    timeout: '1h',
    table: Account,
    signin: () => {},
    siginup: () => {},
}


export default class SurrealRest
    implements ISurrealConnector 
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


    async signin<S extends ISurrealScope>(args: ExtractVars<S>): Promise<string> {
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

        return res;
    }

}

