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
    
    constructor(
        public host: string,
        private NS: string,
        private DB: string,
        private SC?: string,
    ) {}

    //Using a token must be done within the query method since this connector is stateless.
    async query<T>(query: string, params?: Record<string, unknown>): Promise<T[]> {
        return await this.send('query', params ? [query, params] : [query]) as T[];
    }

    async signin<S extends ISurrealScope<unknown, TDefaultSessionVars>>(args: TExtractVars<S>) {
        const surrealArgs = Object.fromEntries(Object.entries(args).map(([key, value]) => [key.replace("$", ""), value]));

        surrealArgs.NS = this.NS;
        surrealArgs.DB = this.DB;
        surrealArgs.SC = this.SC;

        const res = await this.send('signup', [surrealArgs]);
    }

    async signup<Args extends object, ResponseObj>(args: Args) {
        const surrealArgs = Object.fromEntries(Object.entries(args).map(([key, value]) => [key.replace("$", ""), value]));

        // $email: '', $pass: ''
        // email: '', pass: ''
        surrealArgs.NS = this.NS;
        surrealArgs.DB = this.DB;
        surrealArgs.SC = this.SC;

        const res = await this.send('signup', [surrealArgs]);
    }

    async connect() {
        const endpoint = new URL('rpc', this.host.replace('http', 'ws').replace('https  ', 'wss'));

        //Keep alive.
        this.heartbeat = setInterval(() => this.send('ping'), 30_000);

        this.socket = new WebSocket(endpoint.toString());

        this.socket.addEventListener('open', this.processOpen);
        this.socket.addEventListener('message', this.processMessage);
        this.socket.addEventListener('close', this.processClose);
        this.socket.addEventListener('error', this.processError);
    }

    //Processes messages from the websocket.
    private async processMessage(event) {
        const { id, result, method, error } = JSON.parse(event.data as string);

        //Not sure what this does.
        if (method === 'notify') {
            return;
        }

        if (!this.requestMap?.has(id)) {
            console.warn('Received a message with no associated request!');
            console.warn({ id, result, method, error });
            return;
        }

        const [resolve, reject] = this.requestMap.get(id) || [];
        this.requestMap.delete(id);

        error ? reject!(error) : resolve!(result);
    }

    private async processOpen(event) {
       if (this.token) await this.send('authenticate', [this.token]);

       if (this.NS && this.DB) await this.send('use', [this.NS, this.DB]);
    }

    private async processError(event) {
        console.warn("Recieved an error from the websocket!", event);
    }

    private async processClose(event) {
        console.warn("Recieved a close from the websocket!", event);

        //Reject all the pending queries since the connection is closed.
        //TODO: gracefully try to reconnect multiple times before failing.
        this.requestMap?.forEach(([_, reject]) => reject('Connection closed'));
    }

    private async send(method: string, params: any[] = []) {
        const id = uuidv4();

        return new Promise((success, reject) => {
            this.requestMap?.set(id, [success, reject]);

            const data = JSON.stringify({ id, method, params });

            console.log({ data });

            if (this.socket) this.socket?.send(data);
        });
    }
}




type Query = {

}