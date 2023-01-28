import { ISurrealConnector } from '@surreal-tools/client/src/client.interface';

class LucidInstance {
	private surreal_client: ISurrealConnector;

	public init(surreal_client: ISurrealConnector) {
		this.surreal_client = surreal_client;
    }

	public client() {
		return this.surreal_client;
	}
}

export const Lucid = new LucidInstance();

export default Lucid;