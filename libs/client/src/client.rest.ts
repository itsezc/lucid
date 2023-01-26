import { TDefaultSessionVars, ISurrealScope, Model, Table } from '@surreal-tools/orm';
import { ISurrealConnector, TAuthErrorResponse, TAuthSuccessResponse, TExtractVars } from './client.interface';

type TSurrealResponse<T> = {
    result: T[],
    error: {}[],
};

export default class SurrealRest implements ISurrealConnector 
{    
    public token: string;
    
    constructor(
        public host: string,
        private NS: string,
        private DB: string,
        private SC?: string,
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

    async signin<S extends ISurrealScope<unknown, TDefaultSessionVars>>(args: TExtractVars<S>) {
        //Strip out the $ from the request (Surreal does not expect it from the REST api).
        const surrealArgs = Object.fromEntries(Object.entries(args).map(([key, value]) => [key.replace("$", ""), value]));
    
        const res = await fetch(`${this.host}/signin`, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
            },
            body: JSON.stringify({
                ns: this.NS,
                db: this.DB,
                sc: this.SC,
                ...surrealArgs
            })
        });

        const responseJson: TAuthSuccessResponse | TAuthErrorResponse = await res.json();

        if (responseJson.code === 200) this.token = responseJson.token;
        else throw new Error(responseJson.description);
    }

    async signup<Args extends object, ResponseObj>(args: Args) {

        //Strip out the $ from the request (Surreal does not expect it from the REST api).
        const surrealArgs = Object.fromEntries(Object.entries(args).map(([key, value]) => [key.replace("$", ""), value]));
    
        const res = await fetch(`${this.host}/signup`, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
            },
            body: JSON.stringify({
                ns: this.NS,
                db: this.DB,
                sc: this.SC,
                ...surrealArgs
            })
        });

        const responseJson: TAuthSuccessResponse | TAuthErrorResponse = await res.json();

        if (responseJson.code === 200) this.token = responseJson.token;
        else throw new Error(responseJson.description);
    }
}

