export default interface ISurrealConnector {
    query<T>(query: string): Promise<Array<T>>;

    signin(username: string, password: string): Promise<boolean>;
    signup(username: string, password: string): Promise<boolean>;
}