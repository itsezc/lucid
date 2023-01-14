import { Model, SQL } from './';

export type TSurrealEventProps<SubModel extends Model> = {
	name: string;
	when: (keyof SubModel)[];
	then: SQL;
};

export class SurrealEvent<SubModel extends Model> {
	constructor(
		public props: TSurrealEventProps<SubModel>,
		protected table?: SubModel,
	) {}
}

export class SurrealEventManager<SubModel extends Model> {
	private modelled_events: SurrealEvent<SubModel>[];

	constructor(from: SubModel, events: TSurrealEventProps<SubModel>[]) {
		this.modelled_events = events.map((e) => {
			return new SurrealEvent(e, from);
		});
	}
}
