import { Model, TModelProperties } from './';
import { Account } from '../tests/account.spec';

export class SQLBuilder<SubModel extends Model> {
	constructor(private query = '') {}

	public select(fields: (keyof SubModel)[]): SQLBuilder<SubModel> {
		return this;
	}

	public range(): SQLBuilder<SubModel> {
		return this;
	}

	public through(): SQLBuilder<SubModel> {
		return this;
	}

	public in(): SQLBuilder<SubModel> {
		return this;
	}

	public of(): SQLBuilder<SubModel> {
		return this;
	}

	public from(): SQLBuilder<SubModel> {
		return this;
	}

	public build() {
		return this.query;
	}

	public execute() {}

	public live() {}
}

Account.query().select(['username', 'password']).range();
