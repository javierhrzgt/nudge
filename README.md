# nudge

Study planner that turns a task list into a day-by-day calendar of small goals, tracking progress and study time. Built with React, Mantine and Supabase.

## Requirements

- Node 24.15.0
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

## Scripts

- `pnpm dev`: Starts the dev server.
- `pnpm test`: Runs the Vitest test suite.
