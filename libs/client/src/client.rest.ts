import ISurrealConnector from './client.interface';

export default class SurrealRest implements ISurrealConnector {
    //Using a token must be done within the query method since this connector is stateless.
    async query<T>(query: string): Promise<T[]> {

        return [];
    }

    async signin(username: string, password: string): Promise<boolean> {
        return false;
    }

    async signup(username: string, password: string): Promise<boolean> {
        return false;
    }
}