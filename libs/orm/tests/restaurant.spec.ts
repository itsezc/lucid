import { Table, Model, Field, GeoPoint } from '../src';

@Table()
export class Restaurant extends Model {
	@Field()
	title?: string;

	@Field()
	location?: GeoPoint;
}

// With Geospatial:

// query(Restaurant)
// 	.where({
// 		location: {
// 			inside: {
// 				type: 'Polygon',
// 				coordinates: [[
// 					[-0.38314819, 51.37692386], [0.1785278, 51.37692386],
// 					[0.1785278, 51.61460570], [-0.38314819, 51.61460570],
// 					[-0.38314819, 51.37692386]
// 				]]
// 			}
// 		}
// 	})

// SELECT * FROM restaurant WHERE location INSIDE {
// 	type: "Polygon",
// 	coordinates: [[
// 		[-0.38314819, 51.37692386], [0.1785278, 51.37692386],
// 		[0.1785278, 51.61460570], [-0.38314819, 51.61460570],
// 		[-0.38314819, 51.37692386]
// 	]]
// };
