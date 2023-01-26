import { TDefaultSessionVars, ISurrealScope, Model, Table } from '@surreal-tools/orm';
import { ISurrealConnector, TAuthErrorResponse, TAuthSuccessResponse, TExtractVars } from './client.interface';

import { v4 as uuidv4 } from 'uuid';

type TSurrealResponse<T> = {
    result: T[],
    error: {}[],
};

export default class SurrealWS implements ISurrealConnector 
{    
    public token?: string;
    private heartbeat?: NodeJS.Timeout;
    private socket?: WebSocket;
    private requestMap?: Map<string, [(value: unknown) => void, (value: unknown) => void]>;
    public connected: Promise<unknown>;

    public test: string;
    
    constructor(
        public host: string,
        private NS: string,
        private DB: string,
        private SC?: string,
    ) {
        const endpoint = new URL('rpc', host.replace('http', 'ws').replace('https  ', 'wss'));

        //Keep alive.
        this.heartbeat = setInterval(() => this.send('ping'), 30_000);

        this.socket = new WebSocket(endpoint.toString());

        this.test = 'test'
        this.requestMap = new Map();

        this.connected = new Promise((resolve) => {
            this.socket?.addEventListener('open', async (event) => {
                resolve(true);
            });
        });

        this.init();
    }

    public init() {
        if (this.socket) {
            this.socket.addEventListener('open', async (event) => {
                if (this.token) await this.send('authenticate', [this.token]);

                if (this.NS && this.DB) await this.send('use', [this.NS, this.DB]);  
            });
            
            this.socket.addEventListener('message', (event) => {
                const { id, result, method, error } = JSON.parse(event.data);

                //Not sure what this does.
                if (method === 'notify') return;

                if (!this.requestMap?.has(id)) {
                    console.warn('Received a message with no associated request!');
                    console.warn({ id, result, method, error });
                }
                else {
                    const [resolve, reject] = this.requestMap.get(id) || [];
                    this.requestMap.delete(id);
            
                    error ? reject!(error) : resolve!(result);
                }
            });

            this.socket.addEventListener('close', (event) => {
                console.warn("Recieved a close from the websocket!", event);

                this.connected = new Promise((resolve) => {
                    this.socket?.addEventListener('open', async (event) => {
                        resolve(true);
                    });
                });
        
                //Cancel all pending queries.
                //TODO: replace this with a query restart.
                this.requestMap?.forEach(([_, reject]) => reject('Connection closed'));
            });
            this.socket.addEventListener('error', (event) => {
                console.warn("Recieved an error from the websocket!", event);
            });
        }
    }

    async disconnect() {
        this.socket?.close();
    }

    //Using a token must be done within the query method since this connector is stateless.
    async query<T>(query: string, params?: Record<string, unknown>): Promise<T[]> {
        return await this.send('query', params ? [query, params] : [query]) as T[];
    }

    async signin<S extends ISurrealScope<unknown, TDefaultSessionVars>>(args: TExtractVars<S>) {
        const surrealArgs = Object.fromEntries(Object.entries(args).map(([key, value]) => [key.replace("$", ""), value]));

        surrealArgs.NS = this.NS;
        surrealArgs.DB = this.DB;
        surrealArgs.SC = this.SC;

        const res = await this.send('signin', [surrealArgs]);

        this.token = res as string;
    }

    async signup<Args extends object, ResponseObj>(args: Args) {
        const surrealArgs = Object.fromEntries(Object.entries(args).map(([key, value]) => [key.replace("$", ""), value]));

        surrealArgs.NS = this.NS;
        surrealArgs.DB = this.DB;
        surrealArgs.SC = this.SC;

        const res = await this.send('signup', [surrealArgs]);

        this.token = res as string;
    }

    private async send(method: string, params: any[] = []) {
        await this.connected;
        
        const id = uuidv4();

        while (!this.connected) {
            await new Promise((resolve) => setTimeout(resolve, 200));
        }
    
        return new Promise((success, reject) => {
            this.requestMap?.set(id, [success, reject]);

            const data = JSON.stringify({ id, method, params });

            if (this.socket) this.socket?.send(data);
        });
    }
}
