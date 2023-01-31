# Lucid

Lucid helps build & ship apps that scale infinitely with maximum performance, in record time with amazing DX and flexibility.

Backends can be very complex, expensive, and non-performant. Lucid helps solve these problems by providing you with a framework that replaces the need for one; by leveraging SurrealDB, a powerful, all-in-one database engine with a typed abstraction acting as an ORM. This means you don't pay for servers (other than your database), most of the logic is executed on SurrealDB (which is made with Rust and highly performative) and provides full typing so you can focus on your UX and business.


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


### Maintainers

- Chiru B. (@itsezc)
- Drew R. (@DrewRidley)