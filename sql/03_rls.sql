-- =====================================================================
-- NUDGE · 03_rls.sql
-- Politicas RLS y grants por tabla. Re-ejecutable
-- (drop policy if exists + revoke/grant).
-- Requiere: 01_tables.sql y 02_functions.sql.
-- =====================================================================

-- =====================================================================
-- POLITICAS RLS Y GRANTS (tabla por tabla)
-- =====================================================================

-- Seguridad base: anon no toca nada
revoke all on profiles, teacher_students, settings, tasks,
              study_sessions, goals, suggestions from anon;

-- ---- profiles: solo lectura (el alta la hace el trigger) ----
alter table profiles enable row level security;
revoke all on profiles from authenticated;
grant select on profiles to authenticated;

drop policy if exists "profiles_select_own" on profiles;
create policy "profiles_select_own" on profiles
  for select
  using (id = auth.uid());

drop policy if exists "profiles_select_related" on profiles;
create policy "profiles_select_related" on profiles
  for select
  using (is_my_student(id) or is_my_teacher(id));

-- ---- teacher_students: solo lectura (invitaciones por RPC, mas adelante) ----
alter table teacher_students enable row level security;
revoke all on teacher_students from authenticated;
grant select on teacher_students to authenticated;

drop policy if exists "teacher_students_select" on teacher_students;
create policy "teacher_students_select" on teacher_students
  for select
  using (teacher_id = auth.uid() or student_id = auth.uid());

-- ---- settings: el estudiante edita lo suyo; el profesor solo lee ----
alter table settings enable row level security;
revoke all on settings from authenticated;
grant select on settings to authenticated;
grant insert (user_id, work_days, daily_minutes, start_date, timezone)
  on settings to authenticated;
grant update (work_days, daily_minutes, start_date, timezone)
  on settings to authenticated;

drop policy if exists "settings_select_own" on settings;
drop policy if exists "settings_select" on settings;
create policy "settings_select" on settings
  for select
  using (user_id = auth.uid() or is_my_student(user_id));

drop policy if exists "settings_insert_own" on settings;
create policy "settings_insert_own" on settings
  for insert
  with check (user_id = auth.uid());

drop policy if exists "settings_update_own" on settings;
create policy "settings_update_own" on settings
  for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ---- tasks: las gestiona el profesor; el estudiante solo lee ----
alter table tasks enable row level security;
revoke all on tasks from authenticated;
grant select on tasks to authenticated;
grant insert (student_id, title, position) on tasks to authenticated;
grant update (title, position, archived_at) on tasks to authenticated;

drop policy if exists "tasks_select" on tasks;
create policy "tasks_select" on tasks
  for select
  using (student_id = auth.uid() or is_my_student(student_id));

drop policy if exists "tasks_insert" on tasks;
create policy "tasks_insert" on tasks
  for insert
  with check (is_my_student(student_id));

drop policy if exists "tasks_update" on tasks;
create policy "tasks_update" on tasks
  for update
  using (is_my_student(student_id))
  with check (is_my_student(student_id));

-- ---- goals: el profesor edita el plan; el progreso (completed_on,
--      session_id) solo cambia por RPC ----
alter table goals enable row level security;
revoke all on goals from authenticated;
grant select on goals to authenticated;
grant insert (task_id, student_id, title, est_minutes, position)
  on goals to authenticated;
grant update (title, est_minutes, position, archived_at)
  on goals to authenticated;

drop policy if exists "goals_select" on goals;
create policy "goals_select" on goals
  for select
  using (student_id = auth.uid() or is_my_student(student_id));

drop policy if exists "goals_insert" on goals;
create policy "goals_insert" on goals
  for insert
  with check (
    is_my_student(student_id)
    and exists (
      select 1 from tasks
      where tasks.id = goals.task_id
        and tasks.student_id = goals.student_id
    )
  );

-- task_id y student_id no estan en el grant de update, no pueden cambiar
drop policy if exists "goals_update" on goals;
create policy "goals_update" on goals
  for update
  using (is_my_student(student_id))
  with check (is_my_student(student_id));

-- ---- study_sessions: solo lectura (todo se escribe por RPC) ----
alter table study_sessions enable row level security;
revoke all on study_sessions from authenticated;
grant select on study_sessions to authenticated;

drop policy if exists "study_sessions_select" on study_sessions;
create policy "study_sessions_select" on study_sessions
  for select
  using (user_id = auth.uid() or is_my_student(user_id));

-- ---- suggestions: cerrada hasta la fase 4 (RLS activo, sin politicas) ----
alter table suggestions enable row level security;
revoke all on suggestions from authenticated;