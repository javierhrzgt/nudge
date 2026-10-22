-- =====================================================================
-- NUDGE · 02_functions.sql
-- Funciones auxiliares, RPC del estudiante, trigger de alta y
-- permisos de ejecucion. Re-ejecutable (create or replace).
-- Requiere: 01_tables.sql. Ejecutar ANTES de 03_rls.sql
-- (las politicas usan is_my_student / is_my_teacher).
-- =====================================================================

-- =====================================================================
-- 1. FUNCIONES AUXILIARES
-- =====================================================================

-- Para politicas: el usuario actual es profesor activo de ese estudiante
create or replace function is_my_student(p_student uuid) returns boolean
language sql security definer stable
set search_path = public
as $$
  select exists (
    select 1 from teacher_students
    where teacher_id = auth.uid()
      and student_id = p_student
      and status = 'active'
  );
$$;

-- Para politicas: el usuario actual es estudiante activo de ese profesor
create or replace function is_my_teacher(p_teacher uuid) returns boolean
language sql security definer stable
set search_path = public
as $$
  select exists (
    select 1 from teacher_students
    where student_id = auth.uid()
      and teacher_id = p_teacher
      and status = 'active'
  );
$$;

-- "Hoy" segun la zona horaria del estudiante (no la del servidor, que es UTC).
-- Falla si el estudiante no tiene fila en settings (en vez de asumir UTC).
create or replace function student_today() returns date
language plpgsql security definer stable
set search_path = public
as $$
declare
  v_tz text;
begin
  select s.timezone into v_tz from settings s where s.user_id = auth.uid();

  if v_tz is null then
    raise exception 'Falta la configuracion del estudiante (settings)';
  end if;

  return (now() at time zone v_tz)::date;
end;
$$;

-- Interna: exige que quien llama sea estudiante
create or replace function assert_student() returns void
language plpgsql security definer stable
set search_path = public
as $$
begin
  if not exists (
    select 1 from profiles where id = auth.uid() and role = 'student'
  ) then
    raise exception 'Solo los estudiantes pueden hacer esto';
  end if;
end;
$$;

-- Interna: valida inicio de sesion (no futuro y local_date coherente)
create or replace function check_session_start(
  p_started_at timestamptz,
  p_local_date date
) returns void
language plpgsql security definer stable
set search_path = public
as $$
declare
  v_tz text;
begin
  if p_started_at is null or p_local_date is null then
    raise exception 'Fecha de inicio obligatoria';
  end if;

  -- tolerancia de 5 minutos por diferencias de reloj entre cliente y servidor
  if p_started_at > now() + interval '5 minutes' then
    raise exception 'La sesion no puede empezar en el futuro';
  end if;

  select s.timezone into v_tz from settings s where s.user_id = auth.uid();

  if v_tz is null then
    raise exception 'Falta la configuracion del estudiante (settings)';
  end if;

  if p_local_date <> (p_started_at at time zone v_tz)::date then
    raise exception 'La fecha local no coincide con la hora de inicio';
  end if;
end;
$$;


-- =====================================================================
-- 2. RPC DEL ESTUDIANTE
-- Molde: security definer + search_path; identidad desde auth.uid();
-- filtrar siempre por dueno; error explicito si no se afecto nada.
-- =====================================================================

-- ---- start_session ----
create or replace function start_session(p_started_at timestamptz, p_local_date date)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  perform assert_student();
  perform check_session_start(p_started_at, p_local_date);

  begin
    insert into study_sessions (user_id, started_at, local_date)
    values (auth.uid(), p_started_at, p_local_date)
    returning id into v_id;
  exception when unique_violation then
    raise exception 'Ya tienes una sesion abierta';
  end;

  return v_id;
end;
$$;

-- ---- finish_session ----
create or replace function finish_session(
  p_session_id uuid,
  p_duration int,
  p_goal_ids uuid[]
) returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_date date;
  v_count int;
  v_ids uuid[];
begin
  perform assert_student();

  if p_duration is null or p_duration <= 0 or p_duration > 1440 then
    raise exception 'Duracion invalida';
  end if;

  -- sin duplicados
  v_ids := array(select distinct unnest(coalesce(p_goal_ids, '{}'::uuid[])));

  update study_sessions
     set duration_minutes = p_duration
   where id = p_session_id
     and user_id = auth.uid()
     and duration_minutes is null
  returning local_date into v_date;

  if v_date is null then
    raise exception 'Sesion no encontrada o ya terminada';
  end if;

  update goals
     set completed_on = v_date,
         session_id   = p_session_id
   where id = any(v_ids)
     and student_id = auth.uid()
     and archived_at is null
     and completed_on is null;

  get diagnostics v_count = row_count;

  if v_count <> coalesce(array_length(v_ids, 1), 0) then
    raise exception 'Alguna meta no existe, ya esta completada o no te pertenece';
  end if;
end;
$$;

-- ---- create_manual_session ----
create or replace function create_manual_session(
  p_started_at timestamptz,
  p_local_date date,
  p_duration int,
  p_goal_ids uuid[]
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
  v_count int;
  v_ids uuid[];
begin
  perform assert_student();
  perform check_session_start(p_started_at, p_local_date);

  if p_duration is null or p_duration <= 0 or p_duration > 1440 then
    raise exception 'Duracion invalida';
  end if;

  v_ids := array(select distinct unnest(coalesce(p_goal_ids, '{}'::uuid[])));

  insert into study_sessions (user_id, started_at, local_date, duration_minutes)
  values (auth.uid(), p_started_at, p_local_date, p_duration)
  returning id into v_id;

  update goals
     set completed_on = p_local_date,
         session_id   = v_id
   where id = any(v_ids)
     and student_id = auth.uid()
     and archived_at is null
     and completed_on is null;

  get diagnostics v_count = row_count;

  if v_count <> coalesce(array_length(v_ids, 1), 0) then
    raise exception 'Alguna meta no existe, ya esta completada o no te pertenece';
  end if;

  return v_id;
end;
$$;

-- ---- edit_session (opcion C: mover la sesion y las fechas de sus metas) ----
-- Solo sesiones ya cerradas. SIN PROBAR: probar antes de usarla.
-- Para "corregir y terminar" una sesion abandonada: discard_session
-- + create_manual_session con la hora correcta.
create or replace function edit_session(
  p_session_id uuid,
  p_started_at timestamptz,
  p_local_date date,
  p_duration int
) returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  perform assert_student();
  perform check_session_start(p_started_at, p_local_date);

  if p_duration is null or p_duration <= 0 or p_duration > 1440 then
    raise exception 'Duracion invalida';
  end if;

  update study_sessions
     set started_at = p_started_at,
         local_date = p_local_date,
         duration_minutes = p_duration
   where id = p_session_id
     and user_id = auth.uid()
     and duration_minutes is not null;

  if not found then
    raise exception 'Sesion no encontrada o aun abierta (usa finish_session)';
  end if;

  update goals
     set completed_on = p_local_date
   where session_id = p_session_id
     and student_id = auth.uid();
end;
$$;

-- ---- discard_session (solo sesiones abiertas) ----
create or replace function discard_session(p_session_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  perform assert_student();

  delete from study_sessions
   where id = p_session_id
     and user_id = auth.uid()
     and duration_minutes is null;

  if not found then
    raise exception 'Sesion no encontrada o ya terminada';
  end if;
end;
$$;

-- ---- set_goal_completed (meta pendiente, fuera de sesion) ----
create or replace function set_goal_completed(
  p_goal_id uuid,
  p_date date
) returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  perform assert_student();

  if p_date is null or p_date > student_today() then
    raise exception 'Fecha invalida';
  end if;

  update goals
     set completed_on = p_date,
         session_id   = null
   where id = p_goal_id
     and student_id = auth.uid()
     and archived_at is null
     and completed_on is null;

  if not found then
    raise exception 'Meta no encontrada o ya completada';
  end if;
end;
$$;

-- ---- unset_goal_completed ----
create or replace function unset_goal_completed(p_goal_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  perform assert_student();

  update goals
     set completed_on = null,
         session_id   = null
   where id = p_goal_id
     and student_id = auth.uid()
     and archived_at is null
     and completed_on is not null;

  if not found then
    raise exception 'Meta no encontrada o aun pendiente de completar';
  end if;
end;
$$;

-- ---- edit_completion_date (opcion A: solo metas completadas FUERA de sesion;
--      las de sesion se corrigen con edit_session) ----
create or replace function edit_completion_date(
  p_goal_id uuid,
  p_date date
) returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  perform assert_student();

  if p_date is null or p_date > student_today() then
    raise exception 'Fecha invalida';
  end if;

  update goals
     set completed_on = p_date
   where id = p_goal_id
     and student_id = auth.uid()
     and archived_at is null
     and completed_on is not null
     and session_id is null;

  if not found then
    raise exception 'La meta no existe, no esta completada fuera de sesion o no te pertenece';
  end if;
end;
$$;


-- =====================================================================
-- 3. VALIDACION DE ZONA HORARIA EN SETTINGS
-- Una zona invalida romperia las RPC de ese estudiante ("at time zone").
-- =====================================================================

create or replace function validate_settings_timezone()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from pg_timezone_names where name = new.timezone) then
    raise exception 'Zona horaria no valida: %', new.timezone;
  end if;
  return new;
end;
$$;

drop trigger if exists settings_validate_timezone on settings;
create trigger settings_validate_timezone
  before insert or update of timezone on settings
  for each row execute function validate_settings_timezone();


-- =====================================================================
-- 4. TRIGGER DE ALTA DE USUARIOS
-- El rol se lee de user_metadata SOLO al registrarse; despues manda
-- profiles.role. Ser "teacher" sin vinculo activo no da acceso a nada.
-- =====================================================================

create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role text;
begin
  v_role := coalesce(new.raw_user_meta_data->>'role', 'student');
  if v_role not in ('student', 'teacher') then
    v_role := 'student';
  end if;

  insert into profiles (id, role, display_name)
  values (
    new.id,
    v_role,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  );

  if v_role = 'student' then
    insert into settings (user_id) values (new.id);
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();


-- =====================================================================
-- 5. PERMISOS DE EJECUCION
-- Supabase da execute a anon/authenticated por defecto: se quita
-- explicitamente y se concede solo a authenticated, con firma exacta.
-- =====================================================================

-- Usadas por politicas RLS: authenticated necesita ejecutarlas
revoke execute on function is_my_student(uuid) from public, anon;
revoke execute on function is_my_teacher(uuid) from public, anon;
grant execute on function is_my_student(uuid) to authenticated;
grant execute on function is_my_teacher(uuid) to authenticated;

-- Internas (solo las usan otras funciones security definer)
revoke execute on function student_today() from public, anon, authenticated;
revoke execute on function assert_student() from public, anon, authenticated;
revoke execute on function check_session_start(timestamptz, date)
  from public, anon, authenticated;

-- RPC publicas del estudiante
revoke execute on function start_session(timestamptz, date) from public, anon;
revoke execute on function finish_session(uuid, int, uuid[]) from public, anon;
revoke execute on function create_manual_session(timestamptz, date, int, uuid[]) from public, anon;
revoke execute on function edit_session(uuid, timestamptz, date, int) from public, anon;
revoke execute on function discard_session(uuid) from public, anon;
revoke execute on function set_goal_completed(uuid, date) from public, anon;
revoke execute on function unset_goal_completed(uuid) from public, anon;
revoke execute on function edit_completion_date(uuid, date) from public, anon;

grant execute on function start_session(timestamptz, date) to authenticated;
grant execute on function finish_session(uuid, int, uuid[]) to authenticated;
grant execute on function create_manual_session(timestamptz, date, int, uuid[]) to authenticated;
grant execute on function edit_session(uuid, timestamptz, date, int) to authenticated;
grant execute on function discard_session(uuid) to authenticated;
grant execute on function set_goal_completed(uuid, date) to authenticated;
grant execute on function unset_goal_completed(uuid) to authenticated;
grant execute on function edit_completion_date(uuid, date) to authenticated;

-- Funciones de trigger: no deben poder llamarse a mano
revoke execute on function handle_new_user() from public, anon, authenticated;
revoke execute on function validate_settings_timezone() from public, anon, authenticated;