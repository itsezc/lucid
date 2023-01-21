# Surreal ORM

Surreal ORM assists you in building type safe apps with SurrealDB, without the need for a backend (although, you could have one), it is platform and framework agnostic meaning it can run anywhere: React, React Native, Svelte, Tauri, Tauri Mobile, Cloudflare Workers, Bun Serverless and more.

*This project is in beta and a WIP, it targets the Surreal nightly and therefore extends the relevant feature set.*

### Design goal

1) Write your models and logic in Surreal ORM, ideally in its own package: `@org/models`
2) Write your frontend / backend, import `@org/models` and start using Surreal as a web database

## Features

- [x] Designed with type safety (w/ TypeScript) and performance in mind, with a very slim runtime (~10 KB)
- [x] Modeling 
	- 🟢 Permissions
	- 🟢 Assertions
	- 🟢 Events
	- 🟢 Overrides (`name`, `flexible` etc.)
	- 🟢 Indexes
- [x] `Query`, `Create`, `Update` and `Delete` with fully typed Models
- [x] `RELATE` between Models
- [x] `sql` function as an escape hatch for edge cases, with optional type safety
- [x] Build advanced queries with `SELECT`, with type guarantees
- [x] Schema generation with CLI and CI / CD pipelines
- [x] Works on Bun and Cloudflare Workers
- [x] 1:1 Surreal types - `Primitives` (string, int etc.) as well as `GeoJSON` (point, polygon, collection etc.)
- [x] Exposed operators and functions such as `Time`, `String`, `Array` etc. for utility functions
- [x] Scopes definitions

### WIP
- [] Migrations - Auto generated and deterministic SQL with seeding
- [] Live query support
- [] Aggregrate analytics views
- [] Futures

### Roadmap
- [] WASM (Rust) migration for Runtime with additional optimizations, for increased performance