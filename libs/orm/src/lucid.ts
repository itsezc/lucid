import { ISurrealConnector } from '@lucid-framework/surreal/src/client.interface';

class LucidInstance {
	private scope?: string;
	private surreal_client?: ISurrealConnector;

	public tableMetadata = new Map();

	public init(surreal_client: ISurrealConnector) {
		this.surreal_client = surreal_client;
	}

	public client() {
		if (!this.surreal_client) {
			throw new Error(
				'You must initialize a Lucid client before you can use it!',
			);
		}

		return this.surreal_client;
	}

	public setScope(newScope: string) {
		this.scope = newScope;
	}
}

export const Lucid = new LucidInstance();

export default Lucid;
