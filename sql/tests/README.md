# sql/tests · Database tests

They run `01_tables.sql`, `02_functions.sql` and `03_rls.sql` on an **in-memory local
Postgres** ([PGlite](https://pglite.dev)) that simulates what Supabase adds: the `anon` /
`authenticated` roles, `auth.users` and `auth.uid()`. They do not touch your Supabase
project and need no internet after installing.

## How to run them

```bash
cd sql/tests
pnpm install
pnpm test
```

At the end it prints `RESULTADO: N ok, 0 fallos`. If something fails, it shows the name of the test.
To point at another SQL folder: `pnpm test path/to/sql` (or `node run_tests.mjs path/to/sql`).

Add `node_modules/` to your `.gitignore` if you do not have it yet.

## What they cover

| Group | What it checks                                                                                                 |
| ----- | -------------------------------------------------------------------------------------------------------------- |
| A     | Sign-up trigger: profiles, `settings` only for students, an invalid role falls back to `student`               |
| B     | `anon` reads no table and runs no function                                                                     |
| C     | Student: no direct writes, sees only their own data, `settings` validations, internal functions blocked        |
| D     | Teacher: edits only the plan of their own student, cannot touch progress, cannot see someone who is not theirs |
| E     | The 8 RPCs: happy paths, rejections, atomicity, dates, time zone, other users' sessions                        |
| F     | Catalog: execute permissions, column-level writes and RLS enabled on the 7 tables                              |

Everything runs **twice**: after the first pass, `02` and `03` are run again to check that
they are idempotent and that the permissions end up the same.

## How to add a test

Use `asUser(uid, async (q) => { ... })`: it simulates that user (`set local role authenticated`
plus `request.jwt.claims`), and each `q(sql)` runs inside a `savepoint`, so an expected error
does not abort the rest. It returns `{ ok, rows, n }` or `{ ok: false, msg, code }`.
Everything `asUser` does is rolled back when it finishes.

```js
const r = await q(`select set_goal_completed('${g1}', ${TODAY})`);
check("my test", r.ok);
```

## Limitations

PGlite is not Supabase: it simulates the roles and `auth.uid()`, but it does not cover
PostgREST, the real JWT, or your project's default permissions. Use these tests as a safety
net when changing the SQL, and repeat the critical ones on a real Supabase project before
considering something done.
