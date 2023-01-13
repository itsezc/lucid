import React, {
	FC,
	PropsWithChildren,
	useEffect,
	useState,
	useCallback,
} from 'react';
import Surreal, { Result } from 'surrealdb.js';
import { Table } from '.';

interface IDBInfo {
	sc: object;
	tb: object;
}

interface IKVInfo {
	ns: string;
}

interface ISurrealContext {
	url?: string;
	user?: string;
	pass?: string;
	ns?: string;
	db?: string;

	tables: string[];
	namespaces: string[];
	selectedTable?: Table;
	setSelectedTable?: React.Dispatch<React.SetStateAction<Table | undefined>>;
	query: (query: string) => Promise<Result<unknown>[]>;
	use: (ns: string, db: string) => Promise<void>;
	auth: (host: string, user: string, pass: string) => Promise<void>;
	isAuth: boolean;
}

interface ISurrealProviderProps
	extends Partial<
		Pick<ISurrealContext, 'url' | 'user' | 'pass' | 'ns' | 'db'>
	> {}

export const SurrealContext = React.createContext<ISurrealContext>({
	tables: [],
	namespaces: [],
	isAuth: false,
	auth: async () => undefined,
	query: async () => [],
	use: async () => undefined,
});

export const SurrealProvider: FC<PropsWithChildren<ISurrealProviderProps>> = ({
	children,
	...props
}) => {
	const [isAuth, setAuth] = useState(false);
	const [ns, setNS] = useState(props.ns);
	const [db, setDB] = useState(props.db);

	const [namespaces, setNamespaces] = useState<string[]>([]);
	const [tables, setTables] = useState<string[]>([]);
	const [selectedTable, setSelectedTable] = useState<Table>();

	const init = async () => {
		if (props.url && props.user && props.pass) {
			await Surreal.Instance.connect(props.url);
			await Surreal.Instance.signin({
				user: props.user,
				pass: props.pass,
			});

			if (ns && db) await Surreal.Instance.use(ns, db);
		}
	};

	useEffect(() => {
		init();
	}, []);

	useEffect(() => {
		if (isAuth) {
			query('INFO FOR KV;').then((data) => {
				setNamespaces(Object.keys((data[0].result as IKVInfo).ns));
			});
		}
	}, [isAuth]);

	useEffect(() => {
		if (ns) {
			query('INFO FOR DB;').then((data) => {
				setTables(Object.keys((data[0].result as IDBInfo).tb));
			});
		}
	}, [ns]);

	const auth = useCallback(async (host: string, user: string, pass: string) => {
		Surreal.Instance.connect(host).then(() => {
			Surreal.Instance.signin({
				user,
				pass,
			}).then(() => {
				setAuth(true);
			});
		});
	}, []);

	const query = useCallback(async (query: string) => {
		return await Surreal.Instance.query(query);
	}, []);

	const use = useCallback(async (ns: string, db: string) => {
		await Surreal.Instance.use(ns, db);
		setNS(ns);
		setDB(db);
	}, []);

	return (
		<SurrealContext.Provider
			value={{
				...props,
				auth,
				namespaces,
				isAuth,
				selectedTable,
				setSelectedTable,
				tables,
				use,
				query,
			}}
		>
			{children}
		</SurrealContext.Provider>
	);
};
