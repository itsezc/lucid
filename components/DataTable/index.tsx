import { useState, useEffect } from 'react';
import { useSurreal } from '../../surreal/hooks';

import Surreal from 'surrealdb.js';
import { DebounceInput } from 'react-debounce-input';

export const DataTable = () => {
	const { selectedTable } = useSurreal();

	const [tableRecords, setTableRecords] = useState<unknown[]>([]);
	const [selectedTableRecords, setSelectedTableRecords] = useState<string[]>(
		[],
	);

	const tableHeaders = Object.keys(Object.assign({}, ...tableRecords));

	const [sortField, setSortField] = useState<string>();
	const [sortOrder, setSortOrder] = useState<'asc' | 'dsc'>('asc');

	const handleSorting = (field: string, sortOrder: 'asc' | 'dsc') => {
		if (sortField) {
			const sorted = [...tableRecords].sort((a, b) => {
				if (a[sortField] === null) return 1;
				if (b[sortField] === null) return -1;
				if (a[sortField] === null && b[sortField] === null) return 0;

				return (
					a[sortField].toString().localCompare(b[sortField].toString(), 'en', {
						numeric: true,
					}) * (sortOrder === 'asc' ? 1 : -1)
				);
			});
			setTableRecords(sorted);
		}
	};

	const handleSortingChange = (field: string) => {
		const sort = field === sortField && sortOrder === 'asc' ? 'dsc' : 'asc';
		setSortField(field);
		setSortOrder(sortOrder);
		handleSorting(field, sort);
	};

	useEffect(() => {
		if (selectedTable) {
			selectedTable.records().then((records) => setTableRecords(records));
			selectedTable.fields().then((fields) => console.log({ fields }));
		}
	}, [selectedTable, tableRecords]);

	return (
		<table className='t:10 border:collapse'>
			<thead>
				<tr>
					<th className='bg:#222632 p:5|8'>
						<input type='checkbox' />
					</th>
					{tableHeaders
						? tableHeaders.map((row) => (
								// rome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
								<th
									className='ai:center bg:#222632 p:5|8 t:left cursor:pointer'
									key={row}
									onClick={() => handleSortingChange(row)}
								>
									{row}
									{sortField === row && sortOrder === 'asc' ? (
										<i className="ml:4 ri-sort-asc" />
									) : sortField === row && sortOrder === 'dsc' ? (
										<i className="ml:4 ri-sort-desc" />
									) : null}
								</th>
						  ))
						: null}
				</tr>
			</thead>
			<tbody>
				{tableRecords?.map((row, rowIndex) => (
					// rome-ignore lint/suspicious/noArrayIndexKey: <explanation>
					<tr key={rowIndex}>
						<td className='b:1|solid|#222632 p:5|8 t:center'>
							<input type='checkbox' />
						</td>
						{Object.values(row).map((cell, cellIndex) => (
							<td
								className='b:1|solid|#222632 t:left bg:#ff00a0:hover'
								key={cell}
							>
								<DebounceInput
									value={cell as string}
									debounceTimeout={300}
									onChange={async (event) => {
										await Surreal.Instance.change(
											(Object.values(row) as string[])[0],
											{
												[tableHeaders[cellIndex]]: event.target.value,
											},
										);
									}}
									className='w:full p:5|8 outline:none'
								/>
							</td>
						))}
					</tr>
				))}
			</tbody>
		</table>
	);
};
