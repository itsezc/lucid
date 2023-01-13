'use client';

import React from 'react';

import { Table } from '../../../surreal';
import { useSurreal } from '../../../surreal/hooks';
import { DataTable } from '../../../components/DataTable';

export default function Page() {
	const { tables, selectedTable, setSelectedTable } = useSurreal();

	return (
		<>
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
		</>
	);
}
