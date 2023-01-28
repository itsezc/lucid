import { TDefaultSessionVars, ISurrealScope, Model, Table } from '@surreal-tools/orm';
import { ISurrealConnector, TAuthErrorResponse, TAuthSuccessResponse, TExtractVars } from './client.interface';

import { TCredentialDetails, TTokenAuth } from './types';

type TSurrealResponse<T> = {
    result: T[],
    error: {}[],
};


export class SurrealRest<S extends ISurrealScope<unknown, TDefaultSessionVars>> implements ISurrealConnector
{
    // user / pass = root
    // user / root / NS = NS user
    // user / root / NS / DB = DB user
    // <any fields> / NS / DB / SC = scope

    private authType: 'root' | 'ns' | 'db' | 'scope' | 'token' = 'root';

    constructor(
        public host: string,
        private creds: TCredentialDetails
    ) {
        console.log('REST', this.creds);

        // if ('token' in this.creds) this.authType = 'token'; // Token auth
        // else if ('NS' in this.creds && 'DB' in this.creds && 'SC' in this.creds) this.authType  = 'scope'; // Scope auth
        // else if ('NS' in this.creds && 'DB' in this.creds) this.authType = 'db'; // DB auth
        // else if ('NS' in this.creds) this.authType = 'ns'; // NS auth
    }

    //Using a token must be done within the query method since this connector is stateless.
    async query<T>(query: string): Promise<T[]> {
        let Authorization: string | undefined = undefined;

        switch (this.authType) {
            case 'token':
                Authorization = `Bearer ${'token' in this.creds ? this.creds.token : ''}`;
                break;

            case 'root':
            case 'ns':
            case 'db':
                if ('user' in this.creds && 'pass' in this.creds) {
                    Authorization = `Basic ${Buffer.from(`${this.creds.user}:${this.creds.pass}`).toString('base64')}`
                }
                break;
        
            case 'scope':
                // @ts-ignore
                await this.signin<{}>({ ...this.creds });
                break;

            default:
                break;
        }

        const DB = 'DB' in this.creds ? this.creds.DB : undefined;
        const NS = 'NS' in this.creds ? this.creds.NS : undefined;
 
        const res = await fetch(`${this.host}/sql`, {
            method: 'POST',
            //@ts-ignore
            headers: {
                Accept: 'application/json',
                Authorization,
                DB,
                NS,
            },
            body: query
        });

        const json = await res.json();

        return json;
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
                ns: 'NS' in this.creds ? this.creds.NS :'',
                db: 'DB' in this.creds ? this.creds.DB :'',
                sc: 'SC' in this.creds ? this.creds.SC :'',
                ...surrealArgs
            })
        });

        const responseJson: TAuthSuccessResponse | TAuthErrorResponse = await res.json();

        //'NS' in this.creds ? this.creds.NS :''

        if (responseJson.code === 200) {
            'token' in this.creds ? (this.creds.token = responseJson.token) : undefined;
        } 
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
                ns: 'NS' in this.creds ? this.creds.NS : '',
                db: 'DB' in this.creds ? this.creds.DB : '',
                sc: 'SC' in this.creds ? this.creds.SC : '',
                ...surrealArgs
            })
        });

        const responseJson: TAuthSuccessResponse | TAuthErrorResponse = await res.json();

        if (responseJson.code === 200) {
            'token' in this.creds ? (this.creds.token = responseJson.token) : undefined;
        } 
        else throw new Error(responseJson.description);
    }
}

