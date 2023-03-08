# Lucid

Lucid helps build & ship apps that scale infinitely with maximum performance, in record time with amazing DX and no vendor lock-in.

Backends can be very complex, expensive, and non-performant. Lucid helps solve these problems by providing you with a framework that replaces the need for one. By leveraging SurrealDB, a powerful, all-in-one database engine with a typed abstraction acting as an ORM, lucid enables you to ship and scale faster and with ease. This means you don't pay for servers (other than your database), ~~most~~ all of the backend logic is executed on SurrealDB (which is made with Rust and highly performative) and provides full typing so you can focus on your UX and business requirements.

Our target is to build an enterprise ready framework, custom mixins, and a full testing suite, so that you can sleep in peace knowing your app works just the way you expect it to.

## Packages

- ✅ [ORM](https://github.com/itsezc/lucid/tree/master/libs/orm) - Lucid ORM
- ✅ [SurrealDB Client](https://github.com/itsezc/lucid/tree/master/libs/surreal) - TS based client for Surreal DB
- 🚧 [Payments](https://github.com/itsezc/lucid/tree/master/libs/payments) - Manage your billing and payments through Lucid

Internally, Lucid has many packages such as `schema-generator` which handle much of the functionality exposed to you, the developer. We suggest you read the docs to make yourself familiar with the ecosystem.

### FAQ
<details>
	<summary>How does it compare with GraphQL / Hasura?</summary>

	With GraphQL you would have to write a backend, unless you are using a service such as Hasura (which is a layer on top of your DB - incurring additional costs) and types would have to be generated on every build, this could lead to runtime issues if not setup properly and there is an overhead for GraphQL, as well as limited functionality that is limited by the GraphQL spec.

	Still, GraphQL can be a great solution and we advice you do your own research to make the right decision.
</details>

<details>
	<summary>How does it compare with tRPC?</summary>

	tRPC is relatively a new library, which limits you by having you write a backend and forces you to use Node on the backend.

	Still, tRPC can be a great solution and we advice you do your own research to make the right decision.
</details>


<details>
	<summary>Can I use Lucid with React / Vue / Svelte etc.?</summary>

	Lucid is framework agnostic, meaning you can use it with React, Vue, Svelte, Angular or your framework of choice. We intend to provide packages for popular frameworks such as svelte, down the line.
</details>

### Maintainers

- Chiru B. (@itsezc)
- Drew R. (@DrewRidley)
- Soya (@soya-miruku)