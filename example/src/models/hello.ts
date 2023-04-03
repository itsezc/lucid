import { Field, Model, Table } from "@lucid-framework/orm";

@Table({name: "hello"})
export class Hello extends Model {
	@Field() name!: string;
	@Field() age!: number;
	@Field() test!: "One" | "Two" | "Three";
	@Field() isAlive?: boolean;
	@Field() optional?: string;
	@Field() dateAt!: Date;
}
