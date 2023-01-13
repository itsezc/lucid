import Surreal from 'surrealdb.js';

type SurrealDataType =
	| 'string'
	| 'boolean'
	| 'null'
	| 'int'
	| 'float'
	| 'decimal'
	| 'uuid'
	| 'object'
	| 'array'
	| 'date'
	| 'datetime'
	| 'duration'
	| 'point'
	| 'line'
	| 'polygon'
	| 'multipoint'
	| 'multiline'
	| 'multipolygon'
	| 'collection'
	| 'future'
	| `record(${string})`;

interface ITableField {
	field: string;
	type: SurrealDataType;
}

interface ISurrealTableInfoResponse {
	fd: Record<string, string>;
}

export class Table {
	public constructor(public readonly name: string) {}

	public async records(start = 0, limit = 25): Promise<unknown[]> {
		const query = await Surreal.Instance.query(
			`SELECT * FROM ${this.name} LIMIT ${
				limit > 0 && limit <= 100 ? limit.toString() : '25'
			} START ${start}; SELECT count(id) FROM ${this.name}`,
		);

		if (query) return query[0].result as unknown[];

		return [];
	}

	public async fields(): Promise<ITableField[]> {
		const query = await Surreal.Instance.query(`INFO FOR TABLE ${this.name}`);

		// Predefine the id field as it's global
		const fields: ITableField[] = [
			{
				field: 'id',
				type: 'string',
			},
		];

		if (query) {
			for (const [key, value] of Object.entries(
				(query[0].result as ISurrealTableInfoResponse).fd,
			)) {
				fields.push({
					field: key,
					type: value.split('TYPE ').pop()?.split(' ')[0] as SurrealDataType,
				});
			}

			return fields;
		}

		return [];
	}
}
