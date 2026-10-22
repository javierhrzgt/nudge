-- =====================================================================
-- NUDGE · Prueba de humo en Supabase REAL
-- Pegar COMPLETO en el SQL Editor y ejecutar (Run). Da una tabla PASS/FAIL.
--
-- Qué hace: crea datos de prueba temporales para un estudiante, simula a
-- estudiante / profesor / otro estudiante / anon con sus permisos reales
-- (set local role + request.jwt.claims) y llama a las RPC.
--
-- Seguridad: TODO se revierte al final (la función termina con un
-- raise exception atrapado, que deshace los cambios). No queda nada en
-- tus tablas. Las funciones auxiliares viven en pg_temp: desaparecen al
-- cerrarse la sesión.
--
-- Antes de ejecutar, cambia los dos UUID del final (último select):
--   1.º = un estudiante con profesor ACTIVO y fila en settings
--   2.º = otro estudiante (opcional, null para omitir)
-- =====================================================================

create or replace function pg_temp.try(q text) returns text
language plpgsql as $$
begin
  execute q;
  return 'OK';
exception when others then
  return sqlstate || ' ' || sqlerrm;
end;
$$;

create or replace function pg_temp.val(q text) returns text
language plpgsql as $$
declare
  v text;
begin
  execute q into v;
  return coalesce(v, 'null');
exception when others then
  return 'ERR ' || sqlstate || ' ' || sqlerrm;
end;
$$;

create or replace function pg_temp.rec(rep jsonb, paso text, ok boolean, detalle text default '')
returns jsonb language sql as $$
  select rep || jsonb_build_array(
    jsonb_build_object('paso', paso, 'pass', coalesce(ok, false), 'detalle', coalesce(detalle, ''))
  );
$$;

create or replace function pg_temp.nudge_smoke(p_student uuid, p_other uuid default null)
returns table(n int, paso text, resultado text, detalle text)
language plpgsql as $$
declare
  rep jsonb := '[]'::jsonb;
  v_teacher uuid;
  v_tz text;
  v_open int;
  v_task uuid := gen_random_uuid();
  v_g1 uuid := gen_random_uuid();
  v_g2 uuid := gen_random_uuid();
  v_g3 uuid := gen_random_uuid();
  v_g4 uuid := gen_random_uuid();
  v_today date;
  v_ldate date;
  v_old_ts timestamptz;
  v_old_date date;
  v_sid text;
  v_sid2 text;
  v_sid3 text;
  v_fails int;
  v text;
begin
  begin  -- todo lo de este bloque se revierte al final

    -- ---------- 0. Preparación (como postgres) ----------
    select teacher_id into v_teacher
      from teacher_students where student_id = p_student and status = 'active';
    select timezone into v_tz from settings where user_id = p_student;
    rep := pg_temp.rec(rep, '0. El estudiante tiene profesor activo y settings',
      v_teacher is not null and v_tz is not null,
      format('profesor=%s zona=%s', v_teacher, v_tz));
    if v_teacher is null or v_tz is null then raise exception 'SMOKE_STOP'; end if;

    select count(*) into v_open from study_sessions
      where user_id = p_student and duration_minutes is null;

    v_today    := (now() at time zone v_tz)::date;
    v_ldate    := ((now() - interval '1 minute') at time zone v_tz)::date;
    v_old_ts   := now() - interval '2 days';
    v_old_date := (v_old_ts at time zone v_tz)::date;

    insert into tasks (id, student_id, title, position)
      values (v_task, p_student, 'SMOKE tarea (se revierte)', 9999);
    insert into goals (id, task_id, student_id, title, est_minutes, position) values
      (v_g1, v_task, p_student, 'smoke g1', 15, 1),
      (v_g2, v_task, p_student, 'smoke g2', 30, 2),
      (v_g3, v_task, p_student, 'smoke g3', 20, 3),
      (v_g4, v_task, p_student, 'smoke g4', 10, 4);

    -- ---------- A. Como ESTUDIANTE ----------
    execute 'set local role authenticated';
    perform set_config('request.jwt.claims', json_build_object('sub', p_student)::text, true);

    v := pg_temp.val('select auth.uid()::text');
    rep := pg_temp.rec(rep, 'A1. Identidad simulada (auth.uid)', v = p_student::text, v);

    v := pg_temp.val(format('select count(*) from goals where id in (%L,%L,%L,%L)', v_g1, v_g2, v_g3, v_g4));
    rep := pg_temp.rec(rep, 'A2. El estudiante ve sus 4 metas de prueba', v = '4', 'visibles: ' || v);

    v := pg_temp.try(format('update goals set completed_on = current_date where id = %L', v_g1));
    rep := pg_temp.rec(rep, 'A3. Update directo de completed_on rechazado (42501)', v like '42501%', v);

    v := pg_temp.val(format('with u as (update goals set title = %L where id = %L returning 1) select count(*) from u', 'hack', v_g1));
    rep := pg_temp.rec(rep, 'A4. Update directo de title no afecta filas', v = '0', 'filas afectadas: ' || v);

    v := pg_temp.try(format('insert into tasks (student_id, title, position) values (%L, %L, 1)', p_student, 'x'));
    rep := pg_temp.rec(rep, 'A5. El estudiante no puede crear tareas', v <> 'OK', v);

    v_sid := pg_temp.val(format(
      'select create_manual_session(%L::timestamptz, %L::date, 25, array[%L,%L]::uuid[])::text',
      now() - interval '1 minute', v_ldate, v_g1, v_g2));
    rep := pg_temp.rec(rep, 'A6. create_manual_session con 2 metas', v_sid ~ '^[0-9a-f-]{36}$', v_sid);
    if v_sid !~ '^[0-9a-f-]{36}$' then raise exception 'SMOKE_STOP'; end if;

    v := pg_temp.val(format('select count(*) from goals where id in (%L,%L) and session_id = %L and completed_on = %L',
      v_g1, v_g2, v_sid, v_ldate));
    rep := pg_temp.rec(rep, 'A7. Las 2 metas quedaron completadas, con la fecha local y enlazadas a la sesión', v = '2', 'coinciden: ' || v);

    v := pg_temp.try(format(
      'select create_manual_session(%L::timestamptz, %L::date, 25, array[]::uuid[])',
      now() - interval '1 minute', v_ldate + 1));
    rep := pg_temp.rec(rep, 'A8. local_date que no coincide con la hora de inicio: rechazado', v like '%no coincide%', v);

    v := pg_temp.try(format(
      'select create_manual_session(%L::timestamptz, %L::date, 25, array[]::uuid[])',
      now() + interval '2 hours', v_today));
    rep := pg_temp.rec(rep, 'A9. Inicio de sesión en el futuro: rechazado', v like '%futuro%', v);

    v := pg_temp.try(format('select edit_session(%L::uuid, %L::timestamptz, %L::date, 40)', v_sid, v_old_ts, v_old_date));
    rep := pg_temp.rec(rep, 'A10. edit_session mueve la sesión 2 días atrás', v = 'OK', v);

    v := pg_temp.val(format('select count(*) from goals where id in (%L,%L) and session_id = %L and completed_on = %L',
      v_g1, v_g2, v_sid, v_old_date));
    rep := pg_temp.rec(rep, 'A11. Las metas de la sesión siguieron la nueva fecha', v = '2', 'coinciden: ' || v);

    -- sesión abierta: start / segunda sesión / finish / discard
    if v_open > 0 then
      rep := pg_temp.rec(rep, 'A12-A16. OMITIDO: ya tienes una sesión abierta real',
        true, 'ciérrala o descártala en la app y repite esta prueba');
    else
      v_sid2 := pg_temp.val(format('select start_session(now(), %L::date)::text', v_today));
      rep := pg_temp.rec(rep, 'A12. start_session abre una sesión', v_sid2 ~ '^[0-9a-f-]{36}$', v_sid2);
      if v_sid2 !~ '^[0-9a-f-]{36}$' then raise exception 'SMOKE_STOP'; end if;

      v := pg_temp.try(format('select start_session(now(), %L::date)', v_today));
      rep := pg_temp.rec(rep, 'A13. Segunda sesión abierta: mensaje claro', v like '%Ya tienes una sesion abierta%', v);

      v := pg_temp.try(format('select finish_session(%L::uuid, 20, array[%L]::uuid[])', v_sid2, v_g3));
      rep := pg_temp.rec(rep, 'A14. finish_session cierra y marca g3', v = 'OK', v);

      v := pg_temp.val(format('select count(*) from goals where id = %L and session_id = %L and completed_on = %L',
        v_g3, v_sid2, v_today));
      rep := pg_temp.rec(rep, 'A15. g3 quedó con la fecha de la sesión', v = '1', 'coinciden: ' || v);

      v_sid3 := pg_temp.val(format('select start_session(now(), %L::date)::text', v_today));
      v := pg_temp.try(format('select discard_session(%L::uuid)', v_sid3));
      rep := pg_temp.rec(rep, 'A16. discard_session descarta una sesión abierta', v = 'OK', v);
    end if;

    -- metas fuera de sesión (g4)
    v := pg_temp.try(format('select set_goal_completed(%L::uuid, %L::date)', v_g4, v_today + 1));
    rep := pg_temp.rec(rep, 'A17. set_goal_completed rechaza fecha futura', v like '%Fecha invalida%', v);

    v := pg_temp.try(format('select set_goal_completed(%L::uuid, %L::date)', v_g4, v_today));
    rep := pg_temp.rec(rep, 'A18. set_goal_completed marca g4 hoy', v = 'OK', v);

    v := pg_temp.try(format('select edit_completion_date(%L::uuid, %L::date)', v_g4, v_today - 1));
    rep := pg_temp.rec(rep, 'A19. edit_completion_date cambia g4 a ayer', v = 'OK', v);

    v := pg_temp.try(format('select edit_completion_date(%L::uuid, %L::date)', v_g1, v_today - 1));
    rep := pg_temp.rec(rep, 'A20. edit_completion_date rechaza una meta completada dentro de una sesión',
      v like '%fuera de sesion%', v);

    v := pg_temp.try(format('select unset_goal_completed(%L::uuid)', v_g4));
    rep := pg_temp.rec(rep, 'A21. unset_goal_completed desmarca g4', v = 'OK', v);

    v := pg_temp.val(format('select coalesce(completed_on::text, %L) from goals where id = %L', 'null', v_g4));
    rep := pg_temp.rec(rep, 'A22. g4 volvió a pendiente', v = 'null', v);

    v := pg_temp.try(format('select unset_goal_completed(%L::uuid)', v_g4));
    rep := pg_temp.rec(rep, 'A23. unset_goal_completed sobre meta pendiente: rechazado', v like '%pendiente%', v);

    -- ---------- B. Como PROFESOR ----------
    perform set_config('request.jwt.claims', json_build_object('sub', v_teacher)::text, true);

    v := pg_temp.val(format('select count(*) from goals where id in (%L,%L,%L,%L)', v_g1, v_g2, v_g3, v_g4));
    rep := pg_temp.rec(rep, 'B1. El profesor ve las metas de su estudiante', v = '4', 'visibles: ' || v);

    v := pg_temp.val(format('select count(*) from study_sessions where id = %L', v_sid));
    rep := pg_temp.rec(rep, 'B2. El profesor ve las sesiones de su estudiante', v = '1', 'visibles: ' || v);

    v := pg_temp.val(format('select count(*) from settings where user_id = %L', p_student));
    rep := pg_temp.rec(rep, 'B3. El profesor lee los ajustes de su estudiante', v = '1', 'visibles: ' || v);

    v := pg_temp.try(format('update goals set completed_on = current_date where id = %L', v_g4));
    rep := pg_temp.rec(rep, 'B4. El profesor NO puede marcar completed_on (42501)', v like '42501%', v);

    v := pg_temp.val(format('with u as (update goals set title = %L where id = %L returning 1) select count(*) from u', 'editada por profe', v_g1));
    rep := pg_temp.rec(rep, 'B5. El profesor SÍ puede editar el título', v = '1', 'filas afectadas: ' || v);

    v := pg_temp.try(format('insert into goals (task_id, student_id, title, est_minutes, position) values (%L, %L, %L, 10, 9)',
      v_task, p_student, 'meta nueva del profe'));
    rep := pg_temp.rec(rep, 'B6. El profesor puede crear metas para su estudiante', v = 'OK', v);

    v := pg_temp.try(format('select start_session(now(), %L::date)', v_today));
    rep := pg_temp.rec(rep, 'B7. El profesor no puede iniciar sesiones de estudio', v like '%Solo los estudiantes%', v);

    v := pg_temp.try(format('select set_goal_completed(%L::uuid, %L::date)', v_g4, v_today));
    rep := pg_temp.rec(rep, 'B8. El profesor no puede marcar metas por RPC', v like '%Solo los estudiantes%', v);

    -- ---------- C. Como OTRO ESTUDIANTE ----------
    if p_other is not null then
      perform set_config('request.jwt.claims', json_build_object('sub', p_other)::text, true);

      v := pg_temp.val(format('select count(*) from goals where id in (%L,%L,%L,%L)', v_g1, v_g2, v_g3, v_g4));
      rep := pg_temp.rec(rep, 'C1. Otro estudiante NO ve metas ajenas', v = '0', 'visibles: ' || v);

      v := pg_temp.val(format('select count(*) from study_sessions where id = %L', v_sid));
      rep := pg_temp.rec(rep, 'C2. Otro estudiante NO ve sesiones ajenas', v = '0', 'visibles: ' || v);

      v := pg_temp.try(format('select set_goal_completed(%L::uuid, %L::date)', v_g4, date '2000-01-01'));
      rep := pg_temp.rec(rep, 'C3. Otro estudiante NO puede marcar metas ajenas', v like '%no encontrada%', v);

      v := pg_temp.try(format('select edit_session(%L::uuid, %L::timestamptz, %L::date, 30)', v_sid, v_old_ts, v_old_date));
      rep := pg_temp.rec(rep, 'C4. Otro estudiante NO puede editar sesiones ajenas', v <> 'OK', v);
    end if;

    -- ---------- D. Como ANON ----------
    execute 'reset role';
    execute 'set local role anon';
    perform set_config('request.jwt.claims', '', true);

    v := pg_temp.try('select count(*) from goals');
    rep := pg_temp.rec(rep, 'D1. anon no puede leer goals', v like '42501%', v);

    v := pg_temp.try(format('select start_session(now(), %L::date)', v_today));
    rep := pg_temp.rec(rep, 'D2. anon no puede ejecutar start_session', v like '42501%', v);

    raise exception 'SMOKE_ROLLBACK';  -- deshace todo lo creado arriba

  exception when others then
    if sqlerrm not in ('SMOKE_ROLLBACK', 'SMOKE_STOP') then
      rep := pg_temp.rec(rep, 'ERROR INESPERADO (la prueba se detuvo aquí)', false, sqlstate || ' ' || sqlerrm);
    end if;
  end;

  select count(*) into v_fails
    from jsonb_array_elements(rep) as e(x) where not (e.x->>'pass')::boolean;
  rep := pg_temp.rec(rep, 'RESUMEN', v_fails = 0,
    case when v_fails = 0 then 'todo en orden' else v_fails || ' paso(s) con FAIL' end);

  return query
    select e.i::int, e.x->>'paso',
           case when (e.x->>'pass')::boolean then 'PASS' else 'FAIL' end,
           e.x->>'detalle'
    from jsonb_array_elements(rep) with ordinality as e(x, i)
    order by e.i;
end;
$$;

-- >>> CAMBIA ESTOS DOS UUID <<<
select * from pg_temp.nudge_smoke(
  'b0d14a49-8b0a-43c9-9546-a21ce3ab0eed',   -- estudiante (con profesor activo)
  '2c28a91d-9538-4c71-869c-8bc01b44ea1a'    -- otro estudiante (o null)
);
