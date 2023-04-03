import Lucid, { FieldsType, ITable } from "./lucid.js";
import { Model } from "./model.js";
import { toSnakeCase } from "./util.js";
import { Constructor } from "type-fest";

export function Table<SubModel extends Model<boolean>, Name extends string, Edge extends boolean>(props?: ITable<SubModel, Name, Edge>) {
	return (ctor: Constructor<SubModel>) => {
		// const err = new Error();
		// const stack = err.stack?.split("\n");
		// const caller = stack?.[2].trim();
		// const callerName = caller?.split(" ")[1].split(".")[0];
		// const callerType = caller?.split(" ")[0];
		// const callerLine = caller?.split(":")[1];
		// const callerFile = caller?.split(":")?.[0] ?? "";
		// const paths = callerFile.split("/");

		const name = props?.name || toSnakeCase(ctor.name);
		const prototype = ctor.prototype as Model;
		const fieldsOf = FieldsType[ctor.name]?.fields;
		console.log("Table", ctor.name, name, fieldsOf === undefined ? "empty" : "NOT empty");
		// prototype.__modelName = name;
		// prototype.edge = props?.edge;
		if (props) {
			Lucid.set(ctor.name, {
				table: {
					...Lucid.get(ctor.name)?.table,
					...props,
					name,
				} as any,
				fields:
					({
						...Lucid.get(ctor.name)?.fields,
						...fieldsOf,
					} as any) || {},
			});
		}
	};
}
