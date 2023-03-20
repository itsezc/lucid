import { ISurrealScope } from "./scope";
import { ISurrealConnector, TExtractVars } from "./client.interface";
import { v4 as uuidv4 } from "uuid";
import { TCredentialDetails } from "./types";

type TSurrealResponse<T> = {
	result: T[];
	error: {}[];
};

export class SurrealWS implements ISurrealConnector {
	private heartbeat?: NodeJS.Timeout;
	private socket?: WebSocket;
	private requestMap?: Map<
		string,
		[(value: unknown) => void, (value: unknown) => void]
	>;
	public connected?: Promise<unknown>;

	private authType: "root" | "ns" | "db" | "scope" | "token" = "root";

	constructor(public host: string, private creds: TCredentialDetails) {
		this.creds = creds;

		const endpoint = new URL(
			"rpc",
			host.replace("http", "ws").replace("https  ", "wss"),
		);

		//Keep alive.
		this.heartbeat = setInterval(() => this.send("ping"), 30_000);

		this.socket = new WebSocket(endpoint.toString());

		this.requestMap = new Map();

		this.connected = new Promise((resolve) => {
			this.socket?.addEventListener("open", async (event) => {
				this.connected = undefined;

				if (this.creds && "NS" in this.creds && "DB" in this.creds) {
					await this.send("use", [this.creds.NS, this.creds.DB]);
				}

				if ("user" in this.creds && "pass" in this.creds) {
					await this.send("signin", [
						{ ...this.creds, NS: undefined, DB: undefined },
					]);
				}

				if ("token" in this.creds) {
					await this.send("authenticate", [this.creds.token]);
				}

				resolve(true);
			});
		});

		this.init();
	}

	public init() {
		if (this.socket) {
			this.socket.addEventListener("message", (event) => {
				const { id, result, method, error } = JSON.parse(event.data);

				//Not sure what this does.
				if (method === "notify") return;

				if (!this.requestMap?.has(id)) {
					console.warn("Received a message with no associated request!");
					console.warn({ id, result, method, error });
				} else {
					const [resolve, reject] = this.requestMap.get(id) || [];
					this.requestMap.delete(id);

					error ? reject!(error) : resolve!(result);
				}
			});

			this.socket.addEventListener("close", (event) => {
				console.warn("Recieved a close from the websocket!", event);

				this.connected = new Promise((resolve) => {
					this.socket?.addEventListener("open", async (event) => {
						resolve(true);
					});
				});

				//Cancel all pending queries.
				//TODO: replace this with a query restart.
				this.requestMap?.forEach(([_, reject]) => reject("Connection closed"));
			});

			this.socket.addEventListener("error", (event) => {
				console.warn("Recieved an error from the websocket!", event);
			});
		}
	}

	async disconnect() {
		this.socket?.close();
	}

	//Using a token must be done within the query method since this connector is stateless.
	async query<T>(
		query: string,
		params?: Record<string, unknown>,
	): Promise<T[]> {
		return (await this.send(
			"query",
			params ? [query, params] : [query],
		)) as T[];
	}

	async signin<S extends ISurrealScope<unknown, {}> | {}>(
		args: S extends ISurrealScope<unknown, {}> ? TExtractVars<S> : {},
	) {
		let newArgs = { ...this.creds, args };

		const res = await this.send("signin", [newArgs]);

		this.authType = "token";
		this.creds = { token: res as string };
	}

	async signup<S extends ISurrealScope<unknown, {}> | {}>(
		args: S extends ISurrealScope<unknown, {}> ? TExtractVars<S> : {},
	) {
		let newArgs = { ...this.creds, args };

		const res = await this.send("signup", [newArgs]);

		this.authType = "token";
		this.creds = { token: res as string };
	}

	private async send(method: string, params: unknown[] = []) {
		await this.connected;

		const id = uuidv4();

		return new Promise((success, reject) => {
			this.requestMap?.set(id, [success, reject]);

			const data = JSON.stringify({ id, method, params });

			if (this.socket) this.socket?.send(data);
		});
	}
}
