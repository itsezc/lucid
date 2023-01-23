import { ISurrealScope } from "@surreal-tools/orm";

export default interface ISurrealConnector {
    query<T>(query: string): Promise<Array<T>>;

    signin<S>(args: TSurrealAuthArgs | S): Promise<boolean>;
    signup<S>(args: TSurrealAuthArgs | S): Promise<boolean>;
}

type TSurrealAuthArgs = {
    user?: string;
    pass?: string;
    DB?: string;
    NS?: string;
}