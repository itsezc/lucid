import { Model } from './model';

export type TModelProperties<SubModel extends Model> = Omit<
	SubModel,
	'save' | '__tableName'
>;

export type TModelContent<SubModel extends Model> = Omit<TModelProperties<SubModel>, 'id'>;

export type TOmitInternalMethods<T extends Model> = Omit<Partial<TModelProperties<T>>, 'save' | '__tableName'>;

export type TOptionalID<T> = Omit<T, 'id'>

export type TTimeout = `${number}s` | `${number}m`;
export type TDIFF = 'DIFF' | 'BEFORE' | 'AFTER' | 'NONE';