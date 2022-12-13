import { useEffect, useState } from 'react';

import Link from 'next/link';

import { Navbar } from '../components/Navbar';

import Surreal from 'surrealdb.js';
import { Table } from '../surreal';

interface IDBInfo {
	sc: object;
	tb: object;
}

export default function Dashboard() {
	const [ns, setNS] = useState('foretag');
	const [db, setDB] = useState('workshop');

	const [tables, setTables] = useState<string[]>([]);
	const [selectedTable, setSelectedTable] = useState<Table>();

	const [tableRecords, setTableRecords] = useState<unknown[]>([]);

	useEffect(() => {
		const init = async () => {
			await Surreal.Instance.connect('http://localhost:8000/rpc');
			await Surreal.Instance.signin({
				user: 'root',
				pass: 'root',
			});

			await Surreal.Instance.use(ns, db);

			Surreal.Instance.query('INFO FOR DB;').then((data) => {
				setTables(Object.keys((data[0].result as IDBInfo).tb));
			});
		};

		init();
	}, []);

	useEffect(() => {
		if (selectedTable) {
			selectedTable.records().then((records) => setTableRecords(records));
		}
	}, [selectedTable]);

	return (
		<div className='bg:#171a21 h:100vh max-h:100vh flex:col'>
			<div className='flex:col h:full'>
				<div className='flex ai:center bb:1|solid|#2e343f'>
					<div className='p:8 min-w:360 br:1|solid|#2e343f'>
						<div className='flex ai:center gap:8'>
							<Link
								href='https://surrealdb.com/?ref=surreal_manager'
								target='_blank'
							>
								<img
									src='https://surrealdb.com/static/img/assets/icon/icon-3fccfc517c1fa85d61441f736f7bb6ac.svg'
									alt='SurrealDB Logo'
									className='h:32 w:32 bg:#222632 p:2 r:4'
								/>
							</Link>

							<div>
								<p className='f:10 fg:gray-60'>NS: {ns}</p>
								<h2 className='f:14 fg:gray-70'>{db}</h2>
							</div>
						</div>
					</div>
				</div>
				<div className='flex'>
					<Navbar />

					{/* Tables */}
					<ul className='f:10 w:180 br:1|solid|#2e343f {bb:1|solid|#2e343f;p:8;cursor:pointer}>*'>
						<li className='bg:#1B1F28'>Tables ({selectedTable?.name})</li>
						{tables.map((table) => (
							// rome-ignore lint/a11y/useKeyWithClickEvents: keyboard controls not implemented for tables
							<li
								className={`flex ai:center gap:8 ${
									selectedTable?.name === table ? 'bg:#2f3341' : 'bg:#1B1F28'
								}`}
								key={table}
								onClick={() => setSelectedTable(new Table(table))}
							>
								<i
									className={`ri-grid-line ${
										selectedTable?.name === table ? 'fg:#ff00a0' : ''
									}`}
								/>{' '}
								{table}
							</li>
						))}
					</ul>

					<div>
						<table>
							<thead>
								{tableRecords.flatMap(Object.keys).map((row) => (
									<tr key={row}>
										<td>{row}</td>
									</tr>
								))}
							</thead>
						</table>
					</div>
				</div>
			</div>
		</div>
	);
}
