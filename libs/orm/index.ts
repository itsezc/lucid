import Surreal from 'surrealdb.js';

export const db = new Surreal(process.env.NEXT_PUBLIC_SURREAL_HOST);

export * from './field';
export * from './permission';
export * from './model';
export * from './table';
export * from './scope';

export * from './where';
