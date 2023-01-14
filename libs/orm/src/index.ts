import Surreal from 'surrealdb.js';

export const db = new Surreal(process.env.NEXT_PUBLIC_SURREAL_HOST);

export * from './field';
export * from './permissions';
export * from './model';
export * from './table';
export * from './scope';

export * from './where';
export * from './types';
export * from './event';

export * from './sql';
