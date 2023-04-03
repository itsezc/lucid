import { Model, Table } from "@lucid-framework/orm";
import { AdminScope } from "./scopes.js";

@Table({ name: 'abc'})
export class Project extends Model {
	name?: string;
}
