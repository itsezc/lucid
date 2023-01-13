import Link from 'next/link';

import { Navbar } from '../components/Navbar';

import { Table } from '../surreal';
import { Terminal } from '../components/Terminal';
import { useSurreal } from '../surreal/hooks';

import { DataTable } from '../components/DataTable';

export default function Dashboard() {
	const { ns, db, tables, selectedTable, setSelectedTable } = useSurreal();

	return (
		<div className='bg:#171a21 fg:#ffffff h:100vh max-h:100vh flex:col'>
			<div className='flex flex:col h:full'>
				<div className='flex ai:center bb:1|solid|#2e343f'>
					<div className='p:8 min-w:360 br:1|solid|#2e343f'>
						<div className='flex ai:center gap:16 px:8'>
							<Link
								href='https://surrealdb.com/?ref=surreal_editor'
								target='_blank'
							>
								<img
									src='https://surrealdb.com/static/img/assets/icon/icon-3fccfc517c1fa85d61441f736f7bb6ac.svg'
									alt='SurrealDB Logo'
									className='h:32 w:32 bg:#222632 p:2 r:4'
								/>
							</Link>

							<div>
								<p className='f:8 fg:gray-60'>NS: {ns}</p>
								<h2 className='f:12 fg:gray-70'>{db}</h2>
							</div>
						</div>
					</div>

					<div className='flex flex:1 px:16 jc:space-between ai:center'>
						<div>
							<Link
								href='https://surrealdb.com/docs/?ref=surreal-editor'
								target='_blank'
							>
								<div className='f:12 bg:#232632 h:28 w:28 box-shadow:0.3|1|black flex ai:center jc:center r:8'>
									<i className='ri-information-line' />
								</div>
							</Link>
						</div>

						<div>
							<div className='f:12 bg:#232632 h:28 w:28 box-shadow:0.3|1|1|black flex ai:center jc:center r:8'>
								<i className='ri-search-line' />
							</div>
						</div>
					</div>
				</div>
				<div className='flex flex:1'>
					<Navbar />

					{/* Tables */}
					<ul className='f:10 w:180 br:1|solid|#2e343f {bb:1|solid|#2e343f;p:8;cursor:pointer}>*'>
						<li className='flex bg:#1B1F28 h:48 ai:center'>
							Tables ({selectedTable?.name})
						</li>
						{tables.map((table) => (
							// rome-ignore lint/a11y/useKeyWithClickEvents: keyboard controls not implemented for tables
							<li
								className={`flex ai:center gap:8 ${
									selectedTable?.name === table ? 'bg:#2f3341' : 'bg:#1B1F28'
								}`}
								key={table}
								onClick={() =>
									setSelectedTable ? setSelectedTable(new Table(table)) : null
								}
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

					<div className='flex flex:col flex:1'>
						<div className='flex ai:center jc:space-between h:48 px:8 bg:#1B1F28 f:10 bb:1|solid|#2e343f'>
							<ul className='flex {flex;ai:center;gap:6;p:10}>*'>
								<li>
									<i className='ri-refresh-line fg:#454A54' />
									Refresh
								</li>
								<li>
									<i className='ri-filter-line fg:#454A54' />
									Filter
								</li>
								<li>
									<i className='ri-sort-desc fg:#454A54' />
									Sort
								</li>
							</ul>
							<ul className='flex gap:8 {flex;ai:center;gap:6;p:10}>*'>
								<li className='ml:auto'>
									<i className='ri-delete-bin-line fg:#454A54' />
									Delete
								</li>
								<li className='bg:#222632 r:8'>
									<i className='ri-add-line' />
									New
								</li>
							</ul>
						</div>
						<DataTable />
					</div>
				</div>
				{/* <Terminal /> */}
			</div>
		</div>
	);
}
