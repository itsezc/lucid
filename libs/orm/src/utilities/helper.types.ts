export type Primitives = string | number | bigint | boolean;
export type IsUndefined<T> = undefined extends T ? true : false;
export type OfArray<T> = IsUndefined<T> extends true
	? NonNullable<T> extends ReadonlyArray<infer U>
		? { type: U; isReadonly: true; isUndefined: true; isPrimitive: NonNullable<U> extends Primitives ? true : false }
		: NonNullable<T> extends (infer U)[]
		? { type: U; isReadonly: false; isUndefined: true; isPrimitive: NonNullable<U> extends Primitives ? true : false }
		: T
	: T extends ReadonlyArray<infer U>
	? { type: U; isReadonly: true; isUndefined: false; isPrimitive: NonNullable<U> extends Primitives ? true : false }
	: T extends (infer U)[]
	? { type: U; isReadonly: false; isUndefined: false; isPrimitive: NonNullable<U> extends Primitives ? true : false }
	: T;

// rome-ignore lint/suspicious/noExplicitAny: <explanation>
export type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never;
// rome-ignore lint/suspicious/noExplicitAny: <explanation>
export type UnionToOvlds<U> = UnionToIntersection<U extends any ? (f: U) => void : never>;

export type PopUnion<U> = UnionToOvlds<U> extends (a: infer A) => void ? A : never;
export type IsUnion<T> = [T] extends [UnionToIntersection<T>] ? false : true;
export type UnionToArray<T, A extends unknown[] = []> = IsUnion<T> extends true ? UnionToArray<Exclude<T, PopUnion<T>>, [PopUnion<T>, ...A]> : [T, ...A];
export type Constructor<T, Arguments extends unknown[] = unknown[]> = new (...arguments_: Arguments) => T;
export type Simplify<T> = T extends object ? { [KeyType in keyof T]: T[KeyType] } : T;
export type SimplifyDeep<T> = T extends object
	? {
			[KeyType in keyof T]: OfArray<T[KeyType]> extends { type: infer U } ? Simplify<U>[] : Simplify<T[KeyType]>;
	  }
	: T;
export type RenameKey<T, K extends keyof T, NewKey extends string> = Omit<T, K> & { [KeyType in NewKey]: T[K] };
export type KeyOfArraysWithElement<T> = T extends object
	? {
			[K in keyof T as OfArray<T[K]> extends { type: infer U } ? K : never]: OfArray<T[K]> extends { type: infer U } ? U : never;
	  }
	: T;
export type ContainsAllKeys<BaseType, CheckType> = {
	[Key in keyof CheckType]: Key extends keyof BaseType ? (BaseType[Key] extends CheckType[Key] ? true : false) : false;
} extends {
	[Key in keyof CheckType]: true;
}
	? true
	: false;

export type ArrayToUnion<T> = T extends [infer A, ...infer B] ? A | ArrayToUnion<B> : never;

export type UnionToCommaString<T> = UnionToArray<T> extends [infer A, ...infer B]
	? `${A}${B extends [] ? '' : `_${UnionToCommaString<ArrayToUnion<B>>}`}`
	: never;
