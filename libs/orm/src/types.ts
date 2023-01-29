export type GeoPoint = [number, number];

export type GeoMultiPoint = GeoPoint[];

export type GeoLine = GeoPoint[];

export type GeoMultiLine = GeoLine[][];

export type GeoPolygon = GeoPoint[][];

export type GeoMultiPolygon = GeoPolygon[];

export type GeoCollection = GeoObject[];

export type Decimal = number;

export type Float = number;

export type DateTime = Date;

type GeoObject = {
	type:
		| 'Point'
		| 'MultiPoint'
		| 'Line'
		| 'MultiLine'
		| 'Polygon'
		| 'MultiPolygon';
	coordinates:
		| GeoPoint
		| GeoMultiPoint
		| GeoLine
		| GeoMultiLine
		| GeoPolygon
		| GeoMultiPolygon;
};
