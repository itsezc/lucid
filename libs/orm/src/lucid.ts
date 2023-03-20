import { ISurrealConnector } from "@lucid-framework/client";
import { IBasicModel, Model } from "./model";
import { TAssertHandler, TSurrealFieldIndex } from "./field";
import { TPermissions } from "./permissions";
import { Constructor } from "type-fest";

export type ITable<SubModel extends IBasicModel, Name extends string = string, Edge extends boolean = boolean> = {
	name: Name;
	edge?: Edge;
	auditable?: boolean;
	permissions?: TPermissions<SubModel>;
};

export type IFieldRelationProps<T extends Constructor<Model<true>>, IN extends Constructor<Model>, OUT extends Constructor<Model>> = {
	model: T;
	in?: IN;
	out?: OUT;
};

export interface ITableFieldProps<SubModel extends Model> {
	name?: string;
	index?: TSurrealFieldIndex;
	flexible?: boolean;
	assert?: TAssertHandler<SubModel>;
	permissions?: TPermissions<SubModel>;
}

type MetadataFields<SubModel extends Model> = ITableFieldProps<SubModel> & {
	from: string;
	to: string;
	relation?: {
		from: Model;
		via: Constructor<Model<true>>;
		to: Constructor<Model>;
		direction: "IN" | "OUT";
	};
	props: ITableFieldProps<SubModel> | IFieldRelationProps<Constructor<Model<true>>, Constructor<Model>, Constructor<Model>>;
};

export type LucidMetadata<SubModel extends Model> = {
	table: ITable<SubModel>;
	fields: {
		[key: string]: MetadataFields<SubModel>;
	};
};

export class LucidInstance {
	private scope?: string;
	private surreal_client?: ISurrealConnector;
	private tableMetadata = new Map<string, LucidMetadata<Model>>();

	public get(name: string) {
		return this.tableMetadata.get(name);
	}

	public set<Props extends LucidMetadata<Model>>(name: string, value: Props) {
		return this.tableMetadata.set(name, value);
	}

	public get all() {
		return this.tableMetadata;
	}

	public init(surreal_client: ISurrealConnector) {
		this.surreal_client = surreal_client;
	}

	public client() {
		if (!this.surreal_client) {
			throw new Error("You must initialize a Lucid client before you can use it!");
		}

		return this.surreal_client;
	}

	public setScope(newScope: string) {
		this.scope = newScope;
	}
}

export const Lucid = new LucidInstance();

export default Lucid;
