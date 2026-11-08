# nudge

Study planner that turns a task list into a day-by-day calendar of small goals, tracking progress and study time. Built with React, Mantine and Supabase.

## Features

- **Today**: the goals planned for today, with a running study session you can start and finish.
- **Tasks**: your tasks, each split into small goals with estimated minutes.
- **Calendar**: the generated agenda, day by day, with completed and pending goals.
- **Settings**: daily study minutes and time zone.
- **Past sessions**: log a study session you forgot to record, with its date, start time, duration and the goals you completed.

## Tech stack

- React 19, Vite and TypeScript
- Mantine (UI, dates and hooks)
- TanStack Query (server state)
- Supabase (database, auth, row-level security and RPC functions)
- date-fns and date-fns-tz (dates and time zones)
- Vitest (tests)

## Requirements

- Node 24 or later
- pnpm

## Getting started

1. Clone the repo and install dependencies:
   ```bash
   git clone git@github.com:javierhrzgt/nudge.git
   cd nudge/
   pnpm install
   ```
2. Create your local environment file from the example:
   ```bash
   cp .env.example .env
   ```
3. Fill in `.env` with your Supabase project values.
4. Start the dev server:
   ```bash
   pnpm dev
   ```

## Environment variables

| Variable                        | Description                                                                  |
| ------------------------------- | ---------------------------------------------------------------------------- |
| `VITE_SUPABASE_URL`             | Your Supabase project URL. It looks like `https://<project-ref>.supabase.co` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Public (publishable) key used by the browser client                          |

> [!WARNING]
> Never put a secret or `service_role` key in a `VITE_` variable. Those values end up in the browser bundle.

## Database

The schema lives in `sql/`. Run the files in this order in the Supabase SQL editor:

1. `01_tables.sql`
2. `02_functions.sql`
3. `03_rls.sql`

Students never write directly to `tasks`, `goals` or `study_sessions`: every change goes through RPC functions that check ownership with `auth.uid()`, and row-level security protects the rest of the tables.

See [`sql/README.md`](sql/README.md) for the security model, the list of RPC functions and how to repair accounts created before the signup trigger.

The SQL files have their own tests, which run against an in-memory Postgres (PGlite) and do not touch your Supabase project:

```bash
cd sql/tests
pnpm install
pnpm test
```

### Database types

`src/lib/database.types.ts` is generated from the database schema and gives the Supabase client its types, so a wrong RPC name or parameter fails at compile time. Do not edit it by hand. Regenerate it every time you change `sql/`:

```bash
supabase login # only the first time
supabase gen types typescript --project-id <project-ref> --schema public > src/lib/database.types.ts
```

`<project-ref>` is the part of `VITE_SUPABASE_URL` before `.supabase.co`. This needs the [Supabase CLI](https://supabase.com/docs/guides/local-development/cli/getting-started) (on macOS: `brew install supabase/tap/supabase`). If the command fails, restore the file with `git restore src/lib/database.types.ts`.

## Scripts

- `pnpm dev`: Starts the dev server.
- `pnpm build`: Type-checks the project and builds it for production.
- `pnpm preview`: Serves the production build locally.
- `pnpm lint`: Runs ESLint on the whole project.
- `pnpm test`: Runs Vitest in watch mode. Use `pnpm test --run` for a single run.

## Project structure

- `src/lib/`: pure functions (agenda generation, validations, date helpers), each with a unit test next to it (`*.test.ts`). It also holds the Supabase client (`supabase.ts`) and its generated types (`database.types.ts`).
- `src/features/`: screens, components and data hooks, grouped by feature (`agenda`, `calendar`, `sessions`, `settings`, `tasks`, `auth`, `layout`, `profile`).
- `sql/`: database schema, functions and security policies, plus their own tests (see below).

Dates are handled as `yyyy-MM-dd` strings, and time zone conversions go through `date-fns-tz`.

## Contributing

- `main` is protected: create a branch for each change and open a pull request.
- Pull requests are merged with squash.
- Commit messages follow `type(scope): description`, for example `feat(sessions): save manual sessions from the modal`.
- Write the test first when adding logic to `src/lib/`.

## License

See [LICENSE](LICENSE).
