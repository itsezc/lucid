import { 
	type ISurrealScope, 
	type TSurrealPermissionOperation,
	Model
} from './';
import { SQLBuilder } from './builders/select_builder';

interface ISurrealResult {}

interface ISurrealDBInfoResult {
	result: {
		tb: Record<string, string>;
	};
	error?: Error;
}

export class ModelSpec<SubModelType extends typeof Model> {
	constructor(
		protected model: SubModelType, 
		private instance = new model()
	) {}

	public async canOperateWithPermission<
		T extends ISurrealScope<InstanceType<SubModelType>>
	>(
		args: {
			scope?: T,
			model?: ReturnType<T['signup']>,
			query?: SQLBuilder<InstanceType<SubModelType>>
		},
	): Promise<boolean> {
		return false;
	}

	/**
	 * tags: @testing
	 * Check if the table is defined in the database
	 *
	 * @returns Promise<boolean>
	 */
	public async isDefined(): Promise<boolean> {
		// const info = await db.query<ISurrealDBInfoResult[]>('INFO FOR DB');
		// if (info[0].error) return false;
		// if (this.model.getTableName() in info[0].result.tb) return true;
		return false;
	}

	// @todo @testing
	public async hasField(field: string): Promise<boolean> {
		return true;
	}

	// TODO: Run query to check for `in` and `out` fields
	// tags: @testing
	public async isEdge(): Promise<boolean> {
		return false;
	}
}
