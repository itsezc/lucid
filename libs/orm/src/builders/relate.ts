import { Model } from '../model';
import { TModelContent, TOmitInternalMethods } from '../internal';
import { IBuilder, ReturnableBuilder } from './builder';
import { stringifyToSQL } from '../util';

class Relation<
	Edge extends typeof Model = typeof Model,
	T1 extends Model = Model,
	T2 extends Model = Model,
	EdgeInstance extends Model = InstanceType<Edge>
> extends ReturnableBuilder<EdgeInstance> 
	implements IBuilder<EdgeInstance>
{
	protected modelIn?: T1;
	protected modelOut?: T2;
	protected query_content?: object;

	constructor(edge: Edge) {
		const model = new edge();
		// @ts-ignore
		super({ model, query_from: model.__tableName() })
	}
	execute(): EdgeInstance | EdgeInstance[] {
		throw new Error('Method not implemented.');
	}

	public in(model: T1) {
		this.modelIn = model;
		return this;
	}

	public out(model: T2) {
		this.modelOut = model;
		return this;
	}

	public content(content: TModelContent<EdgeInstance>) {
		this.query_content = content;
		return this;
	}

	public build() {
		let query = 'RELATE ';

		query = query.concat(`${this.modelIn?.__tableName()}:${this.modelIn?.id}->${this.query_from}->${this.modelOut?.__tableName()}:${this.modelOut?.id}`);

		if (this.query_content) query = query.concat(' ', 'CONTENT ', stringifyToSQL(this.query_content));

		if (this.query_return) query = query.concat(' ', 'RETURN ', this.query_return);
		if (this.query_timeout) query = query.concat(' ', 'TIMEOUT ', this.query_timeout);
		if (this.query_parallel) query = query.concat(' ', 'PARALLEL');
		
		query = query.concat(';');
		return query;
	}

}

export function relate<Edge extends typeof Model>(edge: Edge): Relation<Edge, Model, Model> {
	return new Relation(edge);
}
