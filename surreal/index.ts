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
	| 'record'
	| 'future';

interface ITableField {
	field: string;
	type: SurrealDataType;
}

interface ISurrealTableInfoResponse {
	fd: Record<string, string>;
}

export class Table {
	public constructor(public readonly name: string) {}

	public async records(): Promise<unknown[]> {
		const query = await Surreal.Instance.query(
			`SELECT * FROM ${this.name} LIMIT 25`,
		);

		if (query) return query[0].result as unknown[];

		return [];
	}

	public async fields(): Promise<ITableField[]> {
		const query = await Surreal.Instance.query(`INFO FOR TABLE ${this.name}`);

		const fields: ITableField[] = [];

		if (query) {
			for (const [key, value] of Object.entries(
				(query[0].result as ISurrealTableInfoResponse).fd,
			)) {
				fields.push({
					field: key,
					type: value.split(' ').splice(-1)[0] as SurrealDataType,
				});
			}

			return fields;
		}

		return [];
	}
}
