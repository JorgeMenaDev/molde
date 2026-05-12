# Molde

Molde is an open-source foundation for building PostgreSQL-aware
forms. It gives you a dense builder workspace with a spreadsheet-like field
sheet, live form preview, schema mapping, and a desktop boundary for local
database access.

The first release is intentionally focused: build a form, map its fields to a
PostgreSQL schema, preview the user-facing experience, and persist the project
locally.

## Demo

Watch the desktop prototype flow:

[Molde desktop demo](demo/molde-desktop-demo.mp4)

## What It Does

- Configure form fields in a compact table-oriented editor.
- Preview the generated form as fields change.
- Map form fields to PostgreSQL schema columns.
- Introspect PostgreSQL schemas from the Electron desktop app.
- Save projects locally through SQLite in the desktop shell.
- Keep the web builder portable with fixture schema data and browser storage.

## Architecture

The app is split around capability boundaries:

- `apps/web` is the portable React builder UI.
- `apps/desktop` wraps the web UI in Electron and owns local privileged work:
  PostgreSQL introspection, SQLite persistence, and inter-process communication.
- `packages/builder-core` contains shared schemas, validation, factory helpers,
  PostgreSQL mapping helpers, and desktop bridge contracts.
- `packages/ui` contains shared Tailwind/Radix-style interface primitives.
- `packages/config` contains shared TypeScript configuration.

This keeps the editor reusable while preventing browser code from directly
owning local database credentials or native storage concerns.

## Stack

- Bun workspaces
- Turborepo
- React 19
- TypeScript
- Vite
- Tailwind CSS
- TanStack Table
- Electron
- PostgreSQL client introspection
- SQLite via `better-sqlite3`
- Vitest

## Requirements

- Bun `1.3.7` or newer
- macOS, Linux, or Windows for the web app
- Electron-supported desktop environment for the desktop app
- PostgreSQL only if you want live schema introspection

## Getting Started

Install dependencies:

```bash
bun install
```

Run the web and desktop development targets:

```bash
bun run dev
```

The web app runs through Vite. The desktop app waits for the Vite server, then
opens the Electron shell.

## Commands

```bash
bun run format
bun run check
bun run test
bun run build
```

Command responsibilities:

- `format` runs Prettier across the workspace.
- `check` runs TypeScript and ESLint through Turborepo.
- `test` runs Vitest across packages.
- `build` builds shared packages, the web app, and the Electron entrypoints.

Use `bun run test`, not `bun test`; the project test command uses Vitest and
the configured browser-like test environment.

## Desktop Capabilities

The desktop app exposes a typed preload bridge:

- `postgres.testConnection`
- `postgres.introspectSchema`
- `projects.list`
- `projects.getLatest`
- `projects.get`
- `projects.save`
- `projects.delete`

The shared contract lives in `packages/builder-core`, so the Electron main
process, preload bridge, and React UI use the same channel names and types.

## Current Status

This is a working prototype/foundation, not a packaged production release.

Verified locally:

- Formatting
- Type checking
- ESLint
- Unit/component tests
- Production build

Known next steps:

- Package and sign desktop builds.
- Exercise live PostgreSQL introspection against more real schemas.
- Add project management views beyond latest-project loading.
- Expand field configuration and option-source editing.
- Add import/export flows for form definitions.

## License

MIT
