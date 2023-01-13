import { ITable, Model, TSurrealDataType } from "./";

import { Account } from "../tests/account.spec";
import { Issue } from "../tests/issue.spec";
import { IssueBlocks } from "../tests/issue_blocks.spec";
import { IssueLabel } from "../tests/issue_label.spec";
import { Organization, MemberOf } from "../tests/organization.spec";
import { Project } from "../tests/project.spec";

export function generateSchemaFromModel<SubModel extends Model>(
	initModel: new (
		props?: ITable<SubModel>,
	) => SubModel,
) {
	const model = new initModel();

	let permissions = "";
	let model_permissions: { permissions: string } =
		initModel.prototype.__get_surreal_properties();

	if (model_permissions?.permissions) {
		const {
			create_permission,
			delete_permission,
			update_permission,
			select_permission,
		} = generatePermissions(model_permissions.permissions);

		permissions = ` PERMISSIONS
	${select_permission}
	${create_permission}
	${update_permission}
	${delete_permission}`;
	}

	const fields = generateFields(initModel, model);

	let schema = `
DEFINE TABLE ${model.getTableName()} SCHEMAFULL${
		permissions
			? `
 ${permissions}`
			: ""
	};

${fields}`;

	console.log(schema);
}

function generatePermissions(perms: string) {
	let permissions = "";

	permissions = perms
		.replaceAll(":", "WHERE")
		.replaceAll("{", "")
		.replaceAll("}", "")
		.replaceAll("\\", "")
		.replaceAll(/\t/g, "\n")
		.replaceAll(/\s\s+/g, " ")
		.slice(1, -1);

	// Split the first part by the words "create_permission", "delete", "select_permission", and "update_permission"
	let create_permission = perms.split("create")[1].trim();
	let delete_permission = perms.split("delete")[1].trim();
	let select_permission = perms.split("select")[1].trim();
	let update_permission = perms.split("update")[1].trim();

	// Remove the other statements from each extracted statement
	create_permission = `FOR create ${create_permission
		.split("delete")[0]
		.split("select")[0]
		.split("update")[0]
		.trim()}`;
	delete_permission = `FOR delete ${delete_permission
		.split("create")[0]
		.split("select")[0]
		.split("update")[0]
		.trim()}`;
	select_permission = `FOR select ${select_permission
		.split("create")[0]
		.split("delete")[0]
		.split("update")[0]
		.trim()}`;
	update_permission = `FOR update ${update_permission
		.split("create")[0]
		.split("delete")[0]
		.split("select")[0]
		.trim()}`;

	return {
		create_permission,
		delete_permission,
		select_permission,
		update_permission,
	};
}

// @todo - Handle objects, arrays & arrays of records
function generateFields<SubModel extends Model>(
	initModel: new (
		props?: ITable<SubModel>,
	) => SubModel,
	model: SubModel,
) {
	let fields = "";
	const internalProperties = ["constructor", "__surreal_properties"];

	for (const field in Object.getOwnPropertyDescriptors(initModel.prototype)) {
		if (!internalProperties.includes(field)) {
			let type = "string";
			const tableName = model.getTableName();

			// @ts-ignore
			const field_name = model[field].name ?? field;

			// @ts-ignore
			switch (model[field].type as TSurrealDataType) {
				case "enum":
					// @ts-ignore
					type = `string ASSERT $value ∈ [${model[field].enum.map(
						// @ts-ignore
						(e) => `'${e}'`,
					)}]`;
					break;

				case "array":
					type = "array";
					break;

				case "record":
					// @ts-ignore
					type = `record(${new model[field].record().getTableName()})`;
					break;

				default:
					// @ts-ignore
					type = model[field].type || type;
					break;
			}

			fields += `DEFINE FIELD ${field_name} ON ${tableName} TYPE ${type}`;

			// @ts-ignore
			if (model[field].permissions) {
				const {
					create_permission,
					delete_permission,
					update_permission,
					select_permission,
				} = generatePermissions(
					// @ts-ignore
					(model[field].permissions as string)
						.toString()
						.replaceAll("\n", "")
						.replaceAll("{", "")
						.replaceAll("}", "")
						.replaceAll("(", "")
						.replaceAll(")", "")
						.replaceAll(",", "")
						.replaceAll("===", "=")
						.replaceAll("||", "OR")
						.replaceAll("&&", "AND")
						.replaceAll(":", " WHERE")
						.replaceAll("auth", "$auth")
						.replaceAll("scope", "$scope")

						.replaceAll("false", "NONE")
						.replaceAll("true", "FULL")

						.replaceAll("WHERE NONE", "NONE")
						.replaceAll("WHERE FULL", "FULL"),
				);

				fields += `
	PERMISSIONS
		${select_permission}
		${create_permission}
		${update_permission}
		${delete_permission}
	`;
			}

			fields += ";\r\n";

			// @ts-ignore
			if (model[field].index) {
				fields += `DEFINE INDEX ${field_name}_idx ON ${tableName} FIELDS ${field}${
					// @ts-ignore
					model[field].index === "unique" ? " UNIQUE" : ""
				};\r\n`;
			}

			// @ts-ignore
			const arrayType =
				// @ts-ignore
				typeof model[field].array === "function" ||
				// @ts-ignore
				typeof model[field].array === "object"
					? // @ts-ignore
					  new model[field].array().getTableName()
					: // @ts-ignore
					  model[field].array;

			// @ts-ignore
			if ((model[field].type as TSurrealDataType) === "array") {
				// @ts-ignore
				fields += `DEFINE FIELD ${field_name}.* ON ${tableName} TYPE record(${arrayType});\r\n`;
			}
		}
	}

	return fields;
}

generateSchemaFromModel(Account);
generateSchemaFromModel(Issue);
generateSchemaFromModel(IssueBlocks);
generateSchemaFromModel(IssueLabel);
generateSchemaFromModel(Organization);
generateSchemaFromModel(MemberOf);
generateSchemaFromModel(Project);
