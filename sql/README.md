# sql/ · Nudge database (Supabase / Postgres)

Current state of the schema, functions and security. Run each file in the Supabase
**SQL Editor**, in this order:

| #   | File               | What it contains                                              | Re-runnable?                                                                                          |
| --- | ------------------ | ------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| 1   | `01_tables.sql`    | The 7 tables, extra constraints and indexes                   | Only the last section ("Ajustes de tablas"); the `create table` statements fail if they already exist |
| 2   | `02_functions.sql` | Helper functions, student RPCs, triggers, execute permissions | Yes                                                                                                   |
| 3   | `03_rls.sql`       | RLS policies and per-table / per-column `grant`s              | Yes                                                                                                   |

**Why this order:** the policies in `03` use `is_my_student` / `is_my_teacher`, which are
defined in `02`; and the functions need the tables from `01` to exist.

## If the database already exists

- From `01_tables.sql`, run **only from** the comment
  `-- Ajustes de tablas (constraints e indices) - re-ejecutable` downwards.
- Run `02_functions.sql` and `03_rls.sql` in full.

## Resetting the database (test data only)

`00_reset.sql` drops the 7 tables (`drop table`) and, with them, **all their data**.
Use it only on a test database; **never** on real data.

- It does not drop the functions (that is why `02_functions.sql` is re-runnable).
- After running it, run `01`, `02` and `03` again, in order.

## Accounts created before the trigger

The `on_auth_user_created` trigger creates `profiles` and `settings` rows on sign-up.
Test accounts created **before** the trigger existed do not have those rows, and the RPCs
will fail with "Falta la configuracion del estudiante (settings)". To repair them:

```sql
insert into profiles (id, role, display_name)
select id, 'student', split_part(email, '@', 1)
from auth.users
where id not in (select id from profiles);

-- if an account should be a teacher:
-- update profiles set role = 'teacher' where id = '<UUID>';

insert into settings (user_id)
select id from profiles where role = 'student'
on conflict do nothing;
```

## Security model (summary)

- **The role lives in `profiles.role`.** It is read from `user_metadata` only at sign-up.
- **Students do not write directly** to `tasks`, `goals` or `study_sessions`: everything
  goes through RPCs (`security definer`) that check ownership with `auth.uid()`.
- **Teachers** edit the plan (`title`, `est_minutes`, `position`, `archived_at`) of the
  tasks and goals of their active student; they **cannot** touch `completed_on` or
  `session_id` (enforced by the column-level `grant`) and have no `delete` (rows are archived).
- **`anon` has no access** to any table or RPC.
- **Internal** functions (`student_today`, `assert_student`, `check_session_start`,
  trigger functions) cannot be executed from the API.

## Student RPCs

| Function                                                              | What it does                                                         |
| --------------------------------------------------------------------- | -------------------------------------------------------------------- |
| `start_session(started_at, local_date)`                               | Opens a session (only one open at a time)                            |
| `finish_session(session_id, duration, goal_ids[])`                    | Closes the session and marks the goals, atomically                   |
| `create_manual_session(started_at, local_date, duration, goal_ids[])` | Creates an already closed session                                    |
| `edit_session(session_id, started_at, local_date, duration)`          | Fixes a **closed** session and moves the `completed_on` of its goals |
| `discard_session(session_id)`                                         | Deletes an **open** (abandoned) session                              |
| `set_goal_completed(goal_id, date)`                                   | Marks a pending goal outside a session                               |
| `unset_goal_completed(goal_id)`                                       | Unmarks it (clears `completed_on` and `session_id`)                  |
| `edit_completion_date(goal_id, date)`                                 | Changes the date of a goal completed **outside a session**           |

Session RPCs check that `started_at` is not in the future (5-minute tolerance) and that
`local_date` matches `started_at` **in the time zone of `settings.timezone`**.

## Important for the client (React)

`local_date` must be computed with the **`settings.timezone` zone**, not the browser's.
If they differ (travel, misconfigured browser), the RPC rejects the session. With `date-fns-tz`:

```ts
import { formatInTimeZone } from "date-fns-tz";
const localDate = formatInTimeZone(startedAt, settings.timezone, "yyyy-MM-dd");
```

The same applies to the app's "today" (`activeDay()`).

## Tests

The tests for these files run against an in-memory Postgres (PGlite) and do not touch
your Supabase project. How to run them and what they cover: [`tests/README.md`](tests/README.md).

## Conventions

- Current state, not history: while there is only test data, these files are edited in place.
  Once there is real data, changes go in new files (`04_...`, `05_...`).
- Nothing secret here: no real keys or emails.
- RPC error messages have no accents on purpose (avoids encoding problems).

## To do

- Triggers: block physical deletes and `est_minutes` changes on completed goals.
- Teacher-student invitation and acceptance (`teacher_students`): rows are created by hand for now.
- `suggestions` policies (the table is currently closed).
- `edit_session` is tested with test data, but its cases should be repeated on a real Supabase project.
