import { ISurrealConnector } from "@lucid-framework/client";
import { IBasicModel, Model } from "./model.js";
import { TAssertHandler, TSurrealFieldIndex } from "./field.js";
import { TPermissions } from "./permissions.js";
import { Constructor } from "type-fest";
import type { TableJson, FieldJson } from "@lucid-framework/type-parser";
import { IModel } from "./model.js";
import fs from "fs";
const projectRoot = import.meta.url.replace("file://", "").replace("/src/lucid.ts", "");
export const FieldsType = JSON.parse(fs.readFileSync(`${projectRoot}/model_types/model_types.json`, "utf8")) as TableJson;

// export const FieldsType = (await Bun.file(`${projectRoot}/model_types/model_types.json`)
// 	.json()
// 	.catch((err) => {
// 		throw new Error(`Could not load model types: ${err}, please make sure you generate the types first`);
// 	})) as TableJson;

export type ITable<SubModel extends IBasicModel, Name extends string = string, Edge extends boolean = boolean> = {
	id?: string;
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

export interface ITableFieldProps<SubModel extends IModel> {
	name?: string;
	index?: TSurrealFieldIndex;
	flexible?: boolean;
	assert?: TAssertHandler<SubModel>;
	permissions?: TPermissions<SubModel>;
}

export type MetadataFields<SubModel extends IModel> = ITableFieldProps<SubModel> & {
	from: string;
	to: string;
	relation?: {
		from: Model;
		via: Constructor<Model<true>>;
		to: Constructor<Model>;
		direction: "IN" | "OUT";
	};
	props: ITableFieldProps<SubModel> | IFieldRelationProps<Constructor<Model<true>>, Constructor<Model>, Constructor<Model>>;
} & FieldJson;

export type LucidMetadata<SubModel extends Model<any>> = {
	table: ITable<SubModel>;
	fields: {
		[key: string]: MetadataFields<SubModel>;
	};
};

type ModelMapArgs<SubModel extends Model, P extends string> = {
	[K in P]: SubModel;
};

type ModelMap<T extends { [K in P]: Constructor<Model<any>> }[], P extends string> = T extends object
	? {
			[K in P]: T extends { [K2 in K]: Constructor<infer M> } ? M : never;
	  }
	: never;

export class LucidInstance {
	private scope?: string;
	private surreal_client?: ISurrealConnector;
	private tableMetadata = new Map<string, LucidMetadata<Model<any>>>();

	public get(name: string) {
		return this.tableMetadata.get(name);
	}

	public set<Props extends LucidMetadata<Model<any>>>(name: string, value: Props) {
		return this.tableMetadata.set(name, value);
	}

	public get all() {
		return this.tableMetadata;
	}

	public get keys() {
		return this.tableMetadata.keys();
	}

	public init(surreal_client: ISurrealConnector) {
		this.surreal_client = surreal_client;
		return this;
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
