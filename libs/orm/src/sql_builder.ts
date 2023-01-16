import { Model, TQueryArgs } from './';
import { joinFields } from './util';

interface ISQLBuilderProps<SubModel extends Model> {
	from_table: string;
	args?: TQueryArgs<SubModel>;
}

export class SQLBuilder<SubModel extends Model> {
	private from_table: string;
	private range: string;
	private select_fields = '*';

	constructor(props: ISQLBuilderProps<SubModel>) {
		this.from_table = props.from_table;
		this.range = joinFields(props.args?.range);
	}

	public select(fields: (keyof SubModel)[]): SQLBuilder<SubModel> {
		this.select_fields = fields.join(', ');
		return this;
	}

	public where(): SQLBuilder<SubModel> {
		return this;
	}

	public through(model: Model): SQLBuilder<SubModel> {
		return this;
	}

	public over(model: Model): SQLBuilder<SubModel> {
		return this;
	}

	public in(model: Model): SQLBuilder<SubModel> {
		return this;
	}

	public of(model: Model): SQLBuilder<SubModel> {
		return this;
	}

	public from(table: string): SQLBuilder<SubModel> {
		this.from_table = table;
		return this;
	}

	public build() {
		return `SELECT ${this.select_fields} FROM ${this.from_table}${
			this.range ? `:${this.range}` : ''
		};`;
	}

	public execute() {}

	public live() {}
}
