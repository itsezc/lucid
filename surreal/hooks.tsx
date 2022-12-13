import { useContext } from 'react';
import { SurrealContext } from './context';

export const useSurreal = () => {
	const { user, use, ns, db, query, tables, selectedTable, setSelectedTable } =
		useContext(SurrealContext);

	return {
		user,
		db,
		ns,
		use,
		query,
		tables,
		selectedTable,
		setSelectedTable,
	};
};
