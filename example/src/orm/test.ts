import { Lucid } from '@surreal-tools/orm';
import { SurrealWS } from '@surreal-tools/client';

Lucid.init(
	new SurrealWS(
		'', 
		{ 
			user: '', 
			pass: '' 
		}
	)
);