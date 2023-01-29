import { Model, TModelProperties } from './';

type TSurrealEventType = 'CREATE' | 'DELETE';

type TSurrealEventAccessors<SubModel extends Model> = {
	$event: TSurrealEventType;
	$after: TModelProperties<SubModel>;
	$before: TModelProperties<SubModel>;
};

// rome-ignore lint/suspicious/noExplicitAny: Currently the type is unknown
type TSurrealEventWhenOperation<M extends Model, T extends any = any> = {
	$: [T, '=' | '!=', T];
	OR?: TSurrealEventTopLevelOperator<M, T>;
};

// rome-ignore lint/suspicious/noExplicitAny: Currently the type is unknown
type TSurrealEventTopLevelOperator<M extends Model, T extends any = any> =
	| TSurrealEventWhenOperation<M, T>
	| TSurrealEventWhenOperation<M, T>[];

// rome-ignore lint/suspicious/noExplicitAny: Currently the type is unknown
type TSurrealEventWhen<M extends Model, T extends any = any> = {
	$: TSurrealEventTopLevelOperator<M, T>[];
	OR: TSurrealEventTopLevelOperator<M, T>[];
};

export type TSurrealEventProps<SubModel extends Model> = {
	name: string;
	when: (cb: TSurrealEventAccessors<SubModel>) => boolean;
	then: (cb: TSurrealEventAccessors<SubModel>) => string | string[];
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
