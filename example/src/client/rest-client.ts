import { SurrealRest } from "@lucid-framework/client";

/**
 * to get the token (for myself) (https://dinochiesa.github.io/jwt/) use this to help test
 * first we create the token in the db:
 * if scoped token then:
 * DEFINE SCOPE {scope_name} #-> you can add more details;
 * DEFINE TOKEN {token_name} ON SCOPE {scope_name} TYPE {algo_type (e.g. HS512)} VALUE "TOKEN_VALUE"; (NOTE- that the token value must be the appropriate length for the algo type, in this case 64bytes)
 * if database token then:
 * DEFINE TOKEN {token_name} ON DATABASE TYPE {algo_type} VALUE "TOKEN_VALUE";
 * there are more information about the token in the docs (https://surrealdb.com/docs/surrealql/statements/define/token) and also in this link: https://stackoverflow.com/questions/74667534/authentication-failure-when-using-external-jwt-token-in-surrealdb
 * for surreal we need to have certain values in the JWT payload
 * these are: "ns", "db", "tk", "exp" (optional, but i had issues without it), "iat" (optional, but i had issues without it)
 * also sc if we are doing scoped token
 * for example:
 * head
 * {
 * 	"alg": "HS512",
 * }
 * 
 * payload
 * {
		"ns": "ttest",
		"db": "ttest",
		"tk": "my_token",
		"iss": "SurrealDB",
		"iat": 1679328653,
		"exp": 1679335853,
		"some_custom_data": "some_custom_data"
		}

		signature
		jl8izichutepraDuFiswLnOtrOSwIrirudospuwrohifrosteDresPEyaStogiyA

		these are all the ingredients needed to make the token auth!
 */

const client = new SurrealRest("http://localhost:8000", {
	NS: "ttest",
	DB: "ttest",
	token: "my_token",
});

const r = new SurrealRest("http://localhost:8000", {
	NS: "ttest",
	DB: "ttest",
}).signup({
	user: "test",
	pass: "test",
});

console.log(await r);

console.log(await client.query("SELECT * FROM user"));
