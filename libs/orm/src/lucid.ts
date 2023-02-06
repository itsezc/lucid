import { ISurrealConnector } from '@surreal-tools/client/src/client.interface';
import { Model } from './model';

class LucidInstance {
	private scope?: string;
	private surreal_client?: ISurrealConnector;
	private tableMetadata = new Map();

	public get(name: string) {
		return this.tableMetadata.get(name);
	}

	public set<Props>(name: string, value: Props) {
		return this.tableMetadata.set(name, value);
	}

	public init(surreal_client: ISurrealConnector) {
		this.surreal_client = surreal_client;
	}

	public client() {
		if (!this.surreal_client) {
			throw new Error('You must initialize a Lucid client before you can use it!');
		}

		return this.surreal_client;
	}

	public setScope(newScope: string) {
		this.scope = newScope;
	}
}

export const Lucid = new LucidInstance();

export default Lucid;
