import { ISurrealConnector } from '@surreal-tools/client/src/client.interface';

class LucidInstance {
	private scope: string;
	private surreal_client: ISurrealConnector;

	public init(surreal_client: ISurrealConnector) {
		this.surreal_client = surreal_client;
	}

	public client() {
		return this.surreal_client;
	}

	public setScope(newScope: string) {
		this.scope = newScope;
	}
}

export const Lucid = new LucidInstance();

export default Lucid;