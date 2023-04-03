import { type SGeoPoint } from "../utilities/types.js";

export class TGeo {
	public static area(geometry: SGeoPoint) {
		return `geo::area(${geometry})`;
	}

	public static bearing(geometry: SGeoPoint) {
		return `geo::bearing(${geometry})`;
	}

	public static centroid(geometry: SGeoPoint) {
		return `geo::centroid(${geometry})`;
	}

	public static distance(point1: SGeoPoint, point2: SGeoPoint) {
		return `geo::distance(${toGeoPoint(point1)}, ${toGeoPoint(point2)})`;
	}

	public static hash_decode(hash: string) {
		return `geo::hash::decode(${hash.toString()})`;
	}

	public static hash_encode(point: SGeoPoint, number?: number) {
		if (number) return `geo::hash::encode(${toGeoPoint(point)}, ${number})`;
		return `geo::hash::encode(${toGeoPoint(point)})`;
	}
}

function toGeoPoint(point: SGeoPoint) {
	return point.toString().replaceAll("[", "(").replaceAll("]", ")");
}
