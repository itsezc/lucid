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

interface ISurrealContext {
	url?: string;
	user?: string;
	pass?: string;
	ns?: string;
	db?: string;

	tables: string[];
	selectedTable?: Table;
	setSelectedTable?: React.Dispatch<React.SetStateAction<Table | undefined>>;
	query: (query: string) => Promise<Result<unknown>[]>;
	use: (ns: string, db: string) => Promise<void>;
}

interface ISurrealProviderProps
	extends Pick<ISurrealContext, 'url' | 'user' | 'pass' | 'ns' | 'db'> {}

export const SurrealContext = React.createContext<ISurrealContext>({
	tables: [],
	query: async () => [],
	use: async () => undefined,
});

export const SurrealProvider: FC<PropsWithChildren<ISurrealProviderProps>> = ({
	children,
	...props
}) => {
	const [ns, setNS] = useState(props.ns);
	const [db, setDB] = useState(props.db);

	const [tables, setTables] = useState<string[]>([]);
	const [selectedTable, setSelectedTable] = useState<Table>();

	useEffect(() => {
		const init = async () => {
			if (!props?.url) throw new Error('DB url not found or valid');

			if (!(props?.user && props?.pass))
				throw new Error('DB user and pass not found or valid');

			await Surreal.Instance.connect(props?.url);

			await Surreal.Instance.signin({
				user: props.user,
				pass: props.pass,
			});

			if (ns && db) await Surreal.Instance.use(ns, db);

			await query('INFO FOR DB;').then((data) => {
				setTables(Object.keys((data[0].result as IDBInfo).tb));
			});
		};

		init();
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
			value={{ ...props, selectedTable, setSelectedTable, tables, use, query }}
		>
			{children}
		</SurrealContext.Provider>
	);
};
