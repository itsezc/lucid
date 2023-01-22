import { Model } from './model';

export type TOmitInternalMethods<T> = Omit<Partial<T>, 'save' | 'getTableName'>;

export type TOptionalID<T> = Omit<T, 'id'>

export type TTimeout = `${number}s`;