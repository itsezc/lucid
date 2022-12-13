import { useContext } from 'react';
import { SurrealContext } from './context';

export const useSurreal = () => {
	const { use, ns, db, query, tables, selectedTable, setSelectedTable } =
		useContext(SurrealContext);

	return {
		db,
		ns,
		use,
		query,
		tables,
		selectedTable,
		setSelectedTable,
	};
};
