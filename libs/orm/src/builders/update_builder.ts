import { Model } from '../model';
import { TMappedModelProperty } from './select_builder';
import { ReturnableBuilder, IBuilderProps, IBuilder } from './builder';

export class UpdateBuilder<SubModel extends Model>
	extends ReturnableBuilder<SubModel> implements IBuilder<SubModel> 
{
	protected query_content: object;
	protected query_merge: object;

	constructor(props: IBuilderProps) {
		super(props);
	}

	public set(fields: TMappedModelProperty<SubModel>) {
		return this;
	}

	public content(fields: TMappedModelProperty<SubModel>) {
		this.query_content = fields;
		return this;
	}

	public merge(fields: TMappedModelProperty<SubModel>) {
		this.query_merge = fields;
		return this;
	}

	public build() {
		let query = `UPDATE ${this.query_from}`;

		if (this.query_merge) query = query.concat(' ', 'MERGE ', JSON.stringify(this.query_merge));

		if (this.query_content) query = query.concat(' ', 'CONTENT ', JSON.stringify(this.query_content));

		if (this.query_return) query = query.concat(' ', 'RETURN ', this.query_return);
		if (this.query_timeout) query = query.concat(' ', 'TIMEOUT ', this.query_timeout);
		if (this.query_parallel) query = query.concat(' ', 'PARALLEL');

		query = query.concat(';');

		return query;
	}
}