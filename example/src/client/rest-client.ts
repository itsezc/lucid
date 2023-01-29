import { SurrealRest } from '@surreal-tools/client/src/client.rest';


const client = new SurrealRest('http://localhost:8000', {
    user: 'test',
    pass: 'abc'
});

console.log(await client.query('INFO FOR NS'));