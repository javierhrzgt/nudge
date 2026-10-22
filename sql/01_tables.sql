-- =====================================================================
-- NUDGE · 01_tables.sql
-- Tablas, constraints adicionales e indices.
-- Orden de ejecucion: 01_tables -> 02_functions -> 03_rls
-- Nota: los create table NO son re-ejecutables (fallan si ya existen).
--       Las secciones de constraints e indices si lo son.
-- =====================================================================

create table profiles (
  id uuid primary key references auth.users,
  role text not null check (role in ('student', 'teacher')),
  display_name text not null
);

-- Un estudiante, un solo profesor: unique sobre student_id
create table teacher_students (
  teacher_id uuid not null references profiles,
  student_id uuid not null references profiles unique,
  status text not null default 'pending' check (status in ('pending', 'active')),
  primary key (teacher_id, student_id)
);

create table settings (
  user_id uuid primary key references profiles,
  work_days int[] not null default '{1,3,5}',   -- 0=dom ... 6=sáb
  daily_minutes int not null default 30,
  start_date date not null default current_date,
  timezone text not null default 'America/Guatemala',
  check (daily_minutes > 0)
);

create table tasks (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references profiles,
  title text not null,
  position int not null,
  created_at timestamptz default now(),
  archived_at timestamptz
);

create table study_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles,
  started_at timestamptz not null,   -- momento exacto de inicio
  local_date date not null,          -- día local de inicio, lo escribe el CLIENTE
  duration_minutes int,              -- null = sesión en curso
  created_at timestamptz default now()
);

-- Una sola sesión abierta por usuario
create unique index one_open_session_per_user
  on study_sessions (user_id)
  where duration_minutes is null;

create table goals (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references tasks,
  student_id uuid not null references profiles,
  title text not null,
  est_minutes int not null,
  position int not null,                                   -- orden dentro de la tarea
  completed_on date,                                       -- null = pendiente
  session_id uuid references study_sessions on delete set null,
  created_at timestamptz default now(),
  archived_at timestamptz,
  check (est_minutes > 0)
);

-- Sugerencias del estudiante al profesor
create table suggestions (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references profiles,
  teacher_id uuid not null references profiles,
  task_id uuid references tasks on delete set null,   -- opcional
  goal_id uuid references goals on delete set null,   -- opcional
  body text not null,
  status text not null default 'open' check (status in ('open', 'accepted', 'dismissed')),
  created_at timestamptz default now()
);


-- =====================================================================
-- Ajustes de tablas (constraints e indices) - re-ejecutable
-- =====================================================================

alter table settings drop constraint if exists settings_work_days_valid;
alter table settings add constraint settings_work_days_valid
  check (
    cardinality(work_days) between 1 and 7
    and work_days <@ array[0,1,2,3,4,5,6]
  );

alter table settings drop constraint if exists settings_daily_minutes_max;
alter table settings add constraint settings_daily_minutes_max
  check (daily_minutes <= 720);

alter table teacher_students drop constraint if exists teacher_students_not_self;
alter table teacher_students add constraint teacher_students_not_self
  check (teacher_id <> student_id);

create index if not exists goals_student_id_idx on goals (student_id);
create index if not exists goals_task_id_idx on goals (task_id);
create index if not exists goals_session_id_idx on goals (session_id);
create index if not exists tasks_student_id_idx on tasks (student_id);
create index if not exists study_sessions_user_date_idx
  on study_sessions (user_id, local_date);