import React, { FC, PropsWithChildren, useEffect, useState } from 'react';
import Surreal from 'surrealdb.js';

interface ISurrealContext {
	url?: string;
	user?: string;
	pass?: string;
	ns?: string;
	db?: string;
}

interface ISurrealProviderProps extends ISurrealContext {}

export const SurrealContext = React.createContext<ISurrealContext>({});

export const SurrealProvider: FC<PropsWithChildren<ISurrealProviderProps>> = ({
	children,
	...props
}) => {
	const [ns, setNS] = useState(props.ns);
	const [db, setDB] = useState(props.db);

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

			Surreal.Instance.query('INFO FOR DB;');
		};

		init();
	}, []);

	return (
		<SurrealContext.Provider value={{ ...props }}>
			{children}
		</SurrealContext.Provider>
	);
};
