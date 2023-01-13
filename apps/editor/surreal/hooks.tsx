import { useContext } from 'react';
import { SurrealContext } from './context';

export const useSurreal = () => {
	const {
		user,
		auth,
		isAuth,
		use,
		ns,
		db,
		query,
		namespaces,
		tables,
		selectedTable,
		setSelectedTable,
	} = useContext(SurrealContext);

	return {
		user,
		auth,
		isAuth,
		db,
		ns,
		use,
		query,
		namespaces,
		tables,
		selectedTable,
		setSelectedTable,
	};
};
