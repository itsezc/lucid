export type SGeoPoint = [number, number];

export type SGeoMultiPoint = SGeoPoint[];

export type SGeoLine = SGeoPoint[];

export type SGeoMultiLine = SGeoLine[][];

export type SGeoPolygon = SGeoPoint[][];

export type SGeoMultiPolygon = SGeoPolygon[];

export type SGeoCollection = SGeoObject[];

export type SDecimal = number;

export type SFloat = number;

export type SDateTime = Date;

type SGeoObject = {
	type:
		| 'Point'
		| 'MultiPoint'
		| 'Line'
		| 'MultiLine'
		| 'Polygon'
		| 'MultiPolygon';
	coordinates:
		| SGeoPoint
		| SGeoMultiPoint
		| SGeoLine
		| SGeoMultiLine
		| SGeoPolygon
		| SGeoMultiPolygon;
};
