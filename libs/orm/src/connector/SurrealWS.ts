import ISurrealConnector from './SurrealConnector';
import WebSocket from 'isomorphic-ws';

export default class SurrealRest implements ISurrealConnector {
    //Executes a query, using the token as the authenticated scope.
    async query<T>(query: string, token = ''): Promise<T[]> {
        return [];
    }

    async signin(username: string, password: string): Promise<boolean> {
        return false;
    }

    async signup(username: string, password: string): Promise<boolean> {
        return false;
    }

    async connect(): Promise<boolean> {
        return false
    }

    //Explicitly disconnects from the database.
    async disconnect(): Promise<boolean> {
        return false;
    }

    async isConnected(): Promise<boolean> {
        return false;
    }

    //Will wait indefinitely for a connection. 
    //NOTE: this does not consider connection problems. Recommended to use a timeout.
    async waitForConnection(timeout: number = -1): Promise<void> {

    }

    //Authenticates this connection using the specified token.
    async authenticate(token: string) {
        return false;
    }
}