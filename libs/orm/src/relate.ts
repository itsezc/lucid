import { Model } from './model';
import { TOmitInternalMethods, TOptionalID, TTimeout } from './internal';

class Relation<
	EdgeProps extends typeof Model = typeof Model,
	T1 extends Model = Model, 
	T2 extends Model = Model, 
> {
	public in(model: T1): Relation<EdgeProps, T1, T2> {
		return this;
	}

	public out(model: T2): Relation<EdgeProps, T1, T2> {
		return this;
	}

	public content(content: { [P in keyof TOmitInternalMethods<InstanceType<EdgeProps>>]: InstanceType<EdgeProps>[P] }): Relation<EdgeProps, T1, T2> {
		return this;
	}

	public return(mode: 'NONE' | 'BEFORE' | 'AFTER' | 'DIFF'): Relation<EdgeProps, T1, T2> {
		return this;
	}

	public timeout(timeout: TTimeout): Relation<EdgeProps, T1, T2> {
		return this;
	}

	public parallel(parallel: boolean): Relation<EdgeProps, T1, T2> {
		return this;
	}
}

export function relate<EdgeProps extends typeof Model>(edge: EdgeProps): Relation<EdgeProps, Model, Model> {
	return new Relation();
}
