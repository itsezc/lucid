import Lucid from '../lucid';
import { Model } from '../model';

import { IBuilder, IBuilderProps, ReturnableBuilder } from './builder';

export class DeleteBuilder<SubModel extends Model> extends ReturnableBuilder<SubModel> implements IBuilder<SubModel> {
	constructor(props: IBuilderProps<SubModel>) {
		super(props);
		this.query_return = 'NONE';
	}

	public build() {
		let query = `DELETE ${this.query_from}`;

		if (this.query_where) query = query.concat(' ', 'WHERE ', this.query_where);
		if (this.query_return) query = query.concat(' ', 'RETURN ', this.query_return);
		if (this.query_timeout) query = query.concat(' ', 'TIMEOUT ', this.query_timeout);
		if (this.query_parallel) query = query.concat(' ', 'PARALLEL');

		query = query.concat(';');

		return query;
	}

	async execute(): Promise<SubModel[]> {
		const query = this.build();
		const response = await Lucid.client().query<SubModel[]>(query);
		console.log(response);
		return response[0].result;
	}
}
