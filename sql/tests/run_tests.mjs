import { PGlite } from '@electric-sql/pglite';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Por defecto lee los .sql de la carpeta superior (sql/). Se puede pasar otra ruta como argumento.
const SQL_DIR = process.argv[2] ?? path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const db = new PGlite();

const T  = 'aaaaaaaa-0000-0000-0000-000000000001'; // profesor vinculado
const T2 = 'aaaaaaaa-0000-0000-0000-000000000002'; // profesor sin vinculo
const S  = 'bbbbbbbb-0000-0000-0000-000000000001'; // estudiante vinculado
const S2 = 'bbbbbbbb-0000-0000-0000-000000000002'; // estudiante sin vinculo
const U5 = 'bbbbbbbb-0000-0000-0000-000000000005'; // rol "admin" en metadata
const tS  = 'cccccccc-0000-0000-0000-000000000001';
const tS2 = 'cccccccc-0000-0000-0000-000000000002';
const g1 = 'dddddddd-0000-0000-0000-000000000001';
const g2 = 'dddddddd-0000-0000-0000-000000000002';
const g3 = 'dddddddd-0000-0000-0000-000000000003';
const gA = 'dddddddd-0000-0000-0000-000000000004'; // archivada
const gO = 'dddddddd-0000-0000-0000-000000000005'; // de S2
const FAKE = 'eeeeeeee-0000-0000-0000-000000000001';

const TODAY = `(now() at time zone 'America/Guatemala')::date`;

let pass = 0, fail = 0;
const failures = [];
function check(name, cond, detail = '') {
  if (cond) { pass++; }
  else { fail++; failures.push(`${name} ${detail}`); console.log(`  FAIL  ${name} ${detail}`); }
}

async function asUser(uid, fn, role = 'authenticated') {
  await db.exec('begin');
  try {
    await db.exec(`set local role ${role}`);
    if (uid) await db.query("select set_config('request.jwt.claims', $1, true)", [JSON.stringify({ sub: uid })]);
    const q = async (sql, params) => {
      await db.exec('savepoint sp');
      try {
        const r = await db.query(sql, params);
        await db.exec('release savepoint sp');
        return { ok: true, rows: r.rows, n: r.affectedRows };
      } catch (e) {
        await db.exec('rollback to savepoint sp');
        return { ok: false, msg: e.message, code: e.code };
      }
    };
    await fn(q);
  } finally {
    await db.exec('rollback');
  }
}

const has = (r, txt) => r && !r.ok && r.msg.toLowerCase().includes(txt.toLowerCase());
const denied = (r) => r && !r.ok && (r.code === '42501');

async function setupMock() {
  await db.exec(`
    create role anon nologin;
    create role authenticated nologin;
    create role service_role nologin bypassrls;
    create schema auth;
    create table auth.users (
      id uuid primary key default gen_random_uuid(),
      email text,
      raw_user_meta_data jsonb not null default '{}'::jsonb
    );
    create function auth.uid() returns uuid language sql stable as $$
      select nullif((nullif(current_setting('request.jwt.claims', true), '')::jsonb)->>'sub','')::uuid
    $$;
    grant usage on schema public to anon, authenticated, service_role;
    grant usage on schema auth to anon, authenticated, service_role;
    grant execute on function auth.uid() to anon, authenticated, service_role;
    alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
    alter default privileges in schema public grant all on functions to anon, authenticated, service_role;
    alter default privileges in schema public grant all on sequences to anon, authenticated, service_role;
  `);
}

async function seed() {
  await db.exec(`
    insert into auth.users (id, email, raw_user_meta_data) values
      ('${T}',  't1@x.com', '{"role":"teacher","display_name":"Profe Uno"}'),
      ('${T2}', 't2@x.com', '{"role":"teacher"}'),
      ('${S}',  's1@x.com', '{}'),
      ('${S2}', 's2@x.com', '{"role":"student"}'),
      ('${U5}', 's5@x.com', '{"role":"admin"}');
    insert into teacher_students (teacher_id, student_id, status) values ('${T}', '${S}', 'active');
    insert into tasks (id, student_id, title, position) values
      ('${tS}',  '${S}',  'Tarea S',  1),
      ('${tS2}', '${S2}', 'Tarea S2', 1);
    insert into goals (id, task_id, student_id, title, est_minutes, position, archived_at) values
      ('${g1}', '${tS}',  '${S}',  'g1', 15, 1, null),
      ('${g2}', '${tS}',  '${S}',  'g2', 30, 2, null),
      ('${g3}', '${tS}',  '${S}',  'g3', 20, 3, null),
      ('${gA}', '${tS}',  '${S}',  'gA', 20, 4, now()),
      ('${gO}', '${tS2}', '${S2}', 'gO', 20, 1, null);
  `);
}

async function suiteTrigger() {
  console.log('A. trigger de alta');
  const p = await db.query('select id, role, display_name from profiles order by id');
  const byId = Object.fromEntries(p.rows.map(r => [r.id, r]));
  check('A1 se crearon 5 perfiles', p.rows.length === 5, `(${p.rows.length})`);
  check('A2 rol teacher respetado', byId[T]?.role === 'teacher');
  check('A3 display_name de metadata', byId[T]?.display_name === 'Profe Uno');
  check('A4 display_name por defecto = parte del email', byId[S]?.display_name === 's1');
  check('A5 rol invalido "admin" se vuelve student', byId[U5]?.role === 'student');
  const s = await db.query('select user_id from settings');
  const ids = s.rows.map(r => r.user_id);
  check('A6 settings solo para estudiantes (3)', ids.length === 3 && !ids.includes(T) && !ids.includes(T2), `(${ids.length})`);
}

async function suiteAnon() {
  console.log('B. anon');
  await asUser(null, async (q) => {
    for (const t of ['profiles','teacher_students','settings','tasks','study_sessions','goals','suggestions']) {
      const r = await q(`select * from ${t}`);
      check(`B1 anon no puede leer ${t}`, denied(r), r.ok ? '(pudo leer)' : `(${r.code})`);
    }
    const r1 = await q(`select start_session(now(), ${TODAY})`);
    check('B2 anon no puede ejecutar start_session', denied(r1), r1.ok ? '(pudo)' : `(${r1.code} ${r1.msg})`);
    const r2 = await q(`select is_my_student('${S}')`);
    check('B3 anon no puede ejecutar is_my_student', denied(r2));
  }, 'anon');
}

async function suiteStudentDirect() {
  console.log('C. estudiante: acceso directo a tablas');
  await asUser(S, async (q) => {
    let r = await q(`select id from goals`);
    check('C1 estudiante ve sus 4 metas y no las ajenas', r.ok && r.rows.length === 4, JSON.stringify(r.rows?.length ?? r.msg));
    r = await q(`select id from tasks`);
    check('C2 estudiante ve solo su tarea', r.ok && r.rows.length === 1 && r.rows[0].id === tS);
    r = await q(`update goals set title = 'hack' where id = '${g1}'`);
    check('C3 update directo de title en goals: 0 filas', r.ok && r.n === 0, JSON.stringify(r));
    r = await q(`update goals set completed_on = ${TODAY} where id = '${g1}'`);
    check('C4 update directo de completed_on: permission denied', denied(r), JSON.stringify(r));
    r = await q(`update goals set student_id = '${S2}' where id = '${g1}'`);
    check('C5 update directo de student_id: permission denied', denied(r));
    r = await q(`insert into tasks (student_id, title, position) values ('${S}', 'mia', 9)`);
    check('C6 estudiante no puede crear tareas (RLS)', !r.ok, JSON.stringify(r));
    r = await q(`insert into goals (task_id, student_id, title, est_minutes, position) values ('${tS}', '${S}', 'x', 10, 9)`);
    check('C7 estudiante no puede crear metas (RLS)', !r.ok);
    r = await q(`delete from goals where id = '${g1}'`);
    check('C8 estudiante no puede borrar metas', denied(r));
    r = await q(`select id from profiles order by id`);
    const ids = r.rows.map(x => x.id).sort();
    check('C9 estudiante ve su perfil y el de su profesor, no otros', ids.length === 2 && ids.includes(S) && ids.includes(T), JSON.stringify(ids));
    r = await q(`select * from teacher_students`);
    check('C10 estudiante ve su vinculo', r.ok && r.rows.length === 1);
    r = await q(`update settings set daily_minutes = 45 where user_id = '${S}'`);
    check('C11 estudiante edita su daily_minutes', r.ok && r.n === 1);
    r = await q(`update settings set daily_minutes = 45 where user_id = '${S2}'`);
    check('C12 estudiante no edita settings ajenos', r.ok && r.n === 0);
    r = await q(`update settings set work_days = '{}' where user_id = '${S}'`);
    check('C13 work_days vacio rechazado', !r.ok && r.code === '23514', JSON.stringify(r));
    r = await q(`update settings set work_days = '{1,7}' where user_id = '${S}'`);
    check('C14 work_days con 7 rechazado', !r.ok && r.code === '23514');
    r = await q(`update settings set daily_minutes = 1000 where user_id = '${S}'`);
    check('C15 daily_minutes > 720 rechazado', !r.ok && r.code === '23514');
    r = await q(`insert into study_sessions (user_id, started_at, local_date) values ('${S}', now(), ${TODAY})`);
    check('C16 insert directo en study_sessions: permission denied', denied(r));
    r = await q(`select student_today()`);
    check('C17 student_today no ejecutable por authenticated', denied(r), JSON.stringify(r));
    r = await q(`select assert_student()`);
    check('C18 assert_student no ejecutable por authenticated', denied(r));
    r = await q(`select check_session_start(now(), ${TODAY})`);
    check('C19 check_session_start no ejecutable por authenticated', denied(r));
    r = await q(`select * from suggestions`);
    check('C20 suggestions cerrada para el estudiante', denied(r));
    r = await q(`select handle_new_user()`);
    check('C21 handle_new_user no ejecutable', !r.ok);
    r = await q(`update settings set timezone = 'Mars/Olympus' where user_id = '${S}'`);
    check('C22 zona horaria invalida rechazada', has(r, 'Zona horaria no valida'), JSON.stringify(r));
    r = await q(`update settings set timezone = 'America/Mexico_City' where user_id = '${S}'`);
    check('C23 zona horaria valida aceptada', r.ok && r.n === 1, JSON.stringify(r));
    r = await q(`select validate_settings_timezone()`);
    check('C24 validate_settings_timezone no ejecutable', !r.ok);
  });
}

async function suiteTeacher() {
  console.log('D. profesor');
  await asUser(T, async (q) => {
    let r = await q(`select id from goals`);
    check('D1 profesor ve las 4 metas de su estudiante, no las de S2', r.ok && r.rows.length === 4, JSON.stringify(r.rows?.length ?? r.msg));
    r = await q(`update goals set title = 'nuevo titulo' where id = '${g1}'`);
    check('D2 profesor edita title de meta de su estudiante', r.ok && r.n === 1, JSON.stringify(r));
    r = await q(`update goals set est_minutes = 25 where id = '${g1}'`);
    check('D3 profesor edita est_minutes', r.ok && r.n === 1);
    r = await q(`update goals set title = 'x' where id = '${gO}'`);
    check('D4 profesor no edita metas de estudiante sin vinculo', r.ok && r.n === 0);
    r = await q(`update goals set completed_on = ${TODAY} where id = '${g1}'`);
    check('D5 profesor NO puede marcar completed_on', denied(r), JSON.stringify(r));
    r = await q(`update goals set session_id = null where id = '${g1}'`);
    check('D6 profesor NO puede tocar session_id', denied(r));
    r = await q(`update goals set student_id = '${S2}' where id = '${g1}'`);
    check('D7 profesor NO puede cambiar student_id', denied(r));
    r = await q(`update goals set task_id = '${tS2}' where id = '${g1}'`);
    check('D8 profesor NO puede cambiar task_id', denied(r));
    r = await q(`update goals set archived_at = now() where id = '${g2}'`);
    check('D9 profesor puede archivar meta', r.ok && r.n === 1);
    r = await q(`insert into goals (task_id, student_id, title, est_minutes, position) values ('${tS}', '${S}', 'nueva', 10, 9)`);
    check('D10 profesor crea meta para su estudiante', r.ok, JSON.stringify(r));
    r = await q(`insert into goals (task_id, student_id, title, est_minutes, position) values ('${tS2}', '${S}', 'cruzada', 10, 9)`);
    check('D11 profesor no crea meta con tarea de otro estudiante', !r.ok);
    r = await q(`insert into goals (task_id, student_id, title, est_minutes, position) values ('${tS2}', '${S2}', 'ajena', 10, 9)`);
    check('D12 profesor no crea meta para estudiante sin vinculo', !r.ok);
    r = await q(`insert into goals (task_id, student_id, title, est_minutes, position, completed_on) values ('${tS}', '${S}', 'trampa', 10, 9, ${TODAY})`);
    check('D13 profesor no puede crear meta ya completada', denied(r));
    r = await q(`insert into tasks (student_id, title, position) values ('${S}', 'tarea nueva', 2)`);
    check('D14 profesor crea tarea para su estudiante', r.ok);
    r = await q(`insert into tasks (student_id, title, position) values ('${S2}', 'tarea ajena', 2)`);
    check('D15 profesor no crea tarea para estudiante sin vinculo', !r.ok);
    r = await q(`update tasks set title = 'renombrada' where id = '${tS}'`);
    check('D16 profesor edita tarea', r.ok && r.n === 1);
    r = await q(`delete from tasks where id = '${tS}'`);
    check('D17 profesor no puede hacer delete (archivado logico)', denied(r));
    r = await q(`select user_id from settings`);
    check('D18 profesor lee settings de su estudiante (solo ese)', r.ok && r.rows.length === 1 && r.rows[0].user_id === S, JSON.stringify(r.rows));
    r = await q(`update settings set daily_minutes = 99 where user_id = '${S}'`);
    check('D19 profesor no edita settings', r.ok && r.n === 0, JSON.stringify(r));
    r = await q(`select id from profiles`);
    const ids = r.rows.map(x => x.id).sort();
    check('D20 profesor ve su perfil y el de su estudiante', ids.length === 2 && ids.includes(T) && ids.includes(S), JSON.stringify(ids));
    r = await q(`select start_session(now(), ${TODAY})`);
    check('D21 profesor no puede iniciar sesion de estudio', has(r, 'solo los estudiantes'), JSON.stringify(r));
    r = await q(`select set_goal_completed('${g3}', ${TODAY})`);
    check('D22 profesor no puede usar set_goal_completed', has(r, 'solo los estudiantes'));
  });

  await asUser(T2, async (q) => {
    let r = await q(`select id from goals`);
    check('D23 profesor sin vinculo no ve metas', r.ok && r.rows.length === 0);
    r = await q(`select id from tasks`);
    check('D24 profesor sin vinculo no ve tareas', r.ok && r.rows.length === 0);
    r = await q(`select id from study_sessions`);
    check('D25 profesor sin vinculo no ve sesiones', r.ok && r.rows.length === 0);
    r = await q(`select user_id from settings`);
    check('D26 profesor sin vinculo no ve settings', r.ok && r.rows.length === 0);
    r = await q(`update goals set title = 'x' where id = '${g1}'`);
    check('D27 profesor sin vinculo no edita metas', r.ok && r.n === 0);
  });
}

async function suiteRPC() {
  console.log('E. RPC del estudiante');
  await asUser(S, async (q) => {
    // --- start_session ---
    let r = await q(`select start_session(now(), ${TODAY} + 1)`);
    check('E1 start_session rechaza local_date que no coincide', has(r, 'no coincide'), JSON.stringify(r));
    r = await q(`select start_session(now() + interval '1 hour', ${TODAY})`);
    check('E2 start_session rechaza inicio futuro', has(r, 'futuro'), JSON.stringify(r));
    r = await q(`select start_session(null, ${TODAY})`);
    check('E3 start_session rechaza started_at nulo', !r.ok);
    r = await q(`select start_session(now(), ${TODAY}) as id`);
    check('E4 start_session ok', r.ok && r.rows[0]?.id, JSON.stringify(r));
    const sid = r.rows?.[0]?.id;
    r = await q(`select start_session(now(), ${TODAY})`);
    check('E5 segunda sesion abierta: mensaje claro', has(r, 'Ya tienes una sesion abierta'), JSON.stringify(r));

    // --- finish_session ---
    r = await q(`select finish_session('${sid}', 0, '{}')`);
    check('E6 finish_session duracion 0 rechazada', has(r, 'Duracion invalida'));
    r = await q(`select finish_session('${sid}', 1441, '{}')`);
    check('E7 finish_session duracion 1441 rechazada', has(r, 'Duracion invalida'));
    r = await q(`select finish_session('${sid}', 30, '{${g1},${gO}}')`);
    check('E8 finish_session con meta ajena falla', has(r, 'Alguna meta'), JSON.stringify(r));
    r = await q(`select duration_minutes from study_sessions where id = '${sid}'`);
    check('E9 atomicidad: la sesion sigue abierta tras el fallo', r.ok && r.rows[0].duration_minutes === null, JSON.stringify(r));
    r = await q(`select completed_on from goals where id = '${g1}'`);
    check('E10 atomicidad: g1 no quedo completada', r.rows[0].completed_on === null);
    r = await q(`select finish_session('${sid}', 30, '{${gA}}')`);
    check('E11 finish_session con meta archivada falla', has(r, 'Alguna meta'));
    r = await q(`select finish_session('${sid}', 30, '{${g1},${g1},${g2}}')`);
    check('E12 finish_session con ids duplicados funciona', r.ok, JSON.stringify(r));
    r = await q(`select id, session_id, completed_on = ${TODAY} as hoy from goals where id in ('${g1}','${g2}') order by id`);
    check('E13 metas quedaron completadas hoy y enlazadas a la sesion',
      r.ok && r.rows.length === 2 && r.rows.every(x => x.session_id === sid && x.hoy === true), JSON.stringify(r.rows));
    r = await q(`select finish_session('${sid}', 30, '{}')`);
    check('E14 finish_session sobre sesion ya terminada falla', has(r, 'ya terminada'));

    // sesion nueva: no puede reusar metas ya completadas
    r = await q(`select start_session(now(), ${TODAY}) as id`);
    const sid2 = r.rows[0].id;
    r = await q(`select finish_session('${sid2}', 10, '{${g1}}')`);
    check('E15 finish_session no pisa meta ya completada', has(r, 'Alguna meta'), JSON.stringify(r));
    r = await q(`select session_id from goals where id = '${g1}'`);
    check('E16 g1 conserva su sesion original', r.rows[0].session_id === sid);

    // --- discard_session ---
    r = await q(`select discard_session('${sid}')`);
    check('E17 discard_session rechaza sesion cerrada', has(r, 'ya terminada'));
    r = await q(`select discard_session('${sid2}')`);
    check('E18 discard_session descarta sesion abierta', r.ok, JSON.stringify(r));
    r = await q(`select count(*)::int as n from study_sessions where id = '${sid2}'`);
    check('E19 la sesion descartada desaparecio', r.rows[0].n === 0);
    r = await q(`select discard_session('${FAKE}')`);
    check('E20 discard_session de id inventado falla', !r.ok);

    // --- create_manual_session ---
    r = await q(`select create_manual_session(now() - interval '1 minute', ((now() - interval '1 minute') at time zone 'America/Guatemala')::date, 25, '{${g3}}') as id`);
    check('E21 create_manual_session ok', r.ok && r.rows[0].id, JSON.stringify(r));
    r = await q(`select create_manual_session(now() - interval '2 minutes', ((now() - interval '2 minutes') at time zone 'America/Guatemala')::date, 25, null) as id`);
    check('E22 create_manual_session con arreglo nulo ok', r.ok, JSON.stringify(r));
    r = await q(`select create_manual_session(now() - interval '2 minutes', ${TODAY}, 25, '{${gO}}')`);
    check('E23 create_manual_session con meta ajena falla', has(r, 'Alguna meta'));
    r = await q(`select create_manual_session(now() - interval '2 minutes', ${TODAY}, 0, '{}')`);
    check('E24 create_manual_session duracion 0 falla', has(r, 'Duracion invalida'));
    r = await q(`select create_manual_session(now() + interval '2 hours', ${TODAY}, 20, '{}')`);
    check('E25 create_manual_session con inicio futuro falla', has(r, 'futuro'));
    r = await q(`select create_manual_session(now() - interval '2 days', ${TODAY}, 20, '{}')`);
    check('E26 create_manual_session con local_date incoherente falla', has(r, 'no coincide'));
    r = await q(`select create_manual_session('2026-10-11 02:00:00+00'::timestamptz, '2026-10-10', 20, '{}')`);
    check('E58 sesion nocturna: vale la fecha local (10-oct), no la UTC (11-oct)', r.ok, JSON.stringify(r));
    r = await q(`select create_manual_session('2026-10-11 02:00:00+00'::timestamptz, '2026-10-11', 20, '{}')`);
    check('E59 sesion nocturna: la fecha UTC se rechaza', has(r, 'no coincide'), JSON.stringify(r));
  });

  await asUser(S, async (q) => {
    // --- set / unset / edit_completion_date (estado limpio de la transaccion) ---
    let r = await q(`select set_goal_completed('${g1}', ${TODAY} + 1)`);
    check('E27 set_goal_completed rechaza fecha futura', has(r, 'Fecha invalida'), JSON.stringify(r));
    r = await q(`select set_goal_completed('${g1}', null)`);
    check('E28 set_goal_completed rechaza fecha nula', has(r, 'Fecha invalida'));
    r = await q(`select set_goal_completed('${gO}', ${TODAY})`);
    check('E29 set_goal_completed rechaza meta ajena', has(r, 'no encontrada'));
    r = await q(`select set_goal_completed('${FAKE}', ${TODAY})`);
    check('E30 set_goal_completed rechaza id inventado', has(r, 'no encontrada'));
    r = await q(`select set_goal_completed('${gA}', ${TODAY})`);
    check('E31 set_goal_completed rechaza meta archivada', has(r, 'no encontrada'));
    r = await q(`select set_goal_completed('${g1}', ${TODAY})`);
    check('E32 set_goal_completed ok', r.ok, JSON.stringify(r));
    r = await q(`select set_goal_completed('${g1}', ${TODAY})`);
    check('E33 set_goal_completed rechaza meta ya completada', has(r, 'ya completada'));

    r = await q(`select edit_completion_date('${g1}', ${TODAY} - 1)`);
    check('E34 edit_completion_date ok sobre meta sin sesion', r.ok, JSON.stringify(r));
    r = await q(`select completed_on = ${TODAY} - 1 as ok from goals where id = '${g1}'`);
    check('E35 la fecha cambio a ayer', r.rows[0].ok === true);
    r = await q(`select edit_completion_date('${g1}', ${TODAY} + 1)`);
    check('E36 edit_completion_date rechaza fecha futura', has(r, 'Fecha invalida'));
    r = await q(`select edit_completion_date('${g1}', null)`);
    check('E37 edit_completion_date rechaza fecha nula', has(r, 'Fecha invalida'));
    r = await q(`select edit_completion_date('${g2}', ${TODAY})`);
    check('E38 edit_completion_date rechaza meta pendiente', !r.ok);
    r = await q(`select edit_completion_date('${gO}', ${TODAY})`);
    check('E39 edit_completion_date rechaza meta ajena', !r.ok);

    r = await q(`select unset_goal_completed('${g2}')`);
    check('E40 unset_goal_completed rechaza meta pendiente', has(r, 'pendiente'));
    r = await q(`select unset_goal_completed('${gO}')`);
    check('E41 unset_goal_completed rechaza meta ajena', !r.ok);
    r = await q(`select unset_goal_completed('${g1}')`);
    check('E42 unset_goal_completed ok', r.ok, JSON.stringify(r));
    r = await q(`select completed_on, session_id from goals where id = '${g1}'`);
    check('E43 la meta volvio a pendiente', r.rows[0].completed_on === null && r.rows[0].session_id === null);

    // meta completada dentro de sesion: edit_completion_date debe rechazar
    r = await q(`select create_manual_session(now() - interval '1 minute', ((now() - interval '1 minute') at time zone 'America/Guatemala')::date, 20, '{${g1},${g2}}') as id`);
    const msid = r.rows[0].id;
    r = await q(`select edit_completion_date('${g1}', ${TODAY} - 1)`);
    check('E44 edit_completion_date rechaza meta completada dentro de sesion', !r.ok, JSON.stringify(r));

    // --- edit_session ---
    r = await q(`select edit_session('${msid}', now() - interval '2 days', ((now() - interval '2 days') at time zone 'America/Guatemala')::date, 40)`);
    check('E45 edit_session ok', r.ok, JSON.stringify(r));
    r = await q(`select g.completed_on = s.local_date as coincide, s.duration_minutes
                 from goals g join study_sessions s on s.id = g.session_id where g.id in ('${g1}','${g2}')`);
    check('E46 edit_session movio completed_on de las dos metas',
      r.ok && r.rows.length === 2 && r.rows.every(x => x.coincide === true && x.duration_minutes === 40), JSON.stringify(r.rows));
    r = await q(`select edit_session('${msid}', now() - interval '2 days', ${TODAY}, 40)`);
    check('E47 edit_session rechaza local_date incoherente', has(r, 'no coincide'));
    r = await q(`select edit_session('${msid}', now(), ${TODAY}, 0)`);
    check('E48 edit_session rechaza duracion 0', has(r, 'Duracion invalida'));
    r = await q(`select start_session(now(), ${TODAY}) as id`);
    const open = r.rows[0].id;
    r = await q(`select edit_session('${open}', now(), ${TODAY}, 30)`);
    check('E49 edit_session rechaza sesion abierta', has(r, 'aun abierta'), JSON.stringify(r));
    r = await q(`select edit_session('${FAKE}', now(), ${TODAY}, 30)`);
    check('E50 edit_session rechaza id inventado', !r.ok);
  });

  // un estudiante no puede tocar sesiones de otro
  await db.exec(`insert into study_sessions (id, user_id, started_at, local_date, duration_minutes)
                 values ('ffffffff-0000-0000-0000-000000000001', '${S2}', now() - interval '1 hour', ${TODAY}, 30)`);
  await db.exec(`insert into study_sessions (id, user_id, started_at, local_date)
                 values ('ffffffff-0000-0000-0000-000000000002', '${S2}', now() - interval '1 hour', ${TODAY})`);
  await asUser(S, async (q) => {
    let r = await q(`select id from study_sessions`);
    check('E51 estudiante no ve sesiones ajenas', r.ok && r.rows.length === 0, JSON.stringify(r.rows));
    r = await q(`select edit_session('ffffffff-0000-0000-0000-000000000001', now(), ${TODAY}, 30)`);
    check('E52 edit_session rechaza sesion ajena', !r.ok);
    r = await q(`select discard_session('ffffffff-0000-0000-0000-000000000002')`);
    check('E53 discard_session rechaza sesion ajena', !r.ok);
    r = await q(`select finish_session('ffffffff-0000-0000-0000-000000000002', 30, '{}')`);
    check('E54 finish_session rechaza sesion ajena', !r.ok);
  });
  await asUser(T, async (q) => {
    const r = await q(`select id from study_sessions`);
    check('E55 profesor ve sesiones de su estudiante (con detalle), no las de S2', r.ok && r.rows.length === 0, JSON.stringify(r.rows));
  });
  await db.exec(`delete from study_sessions`);

  // estudiante sin fila en settings: error claro (no asumir UTC)
  await db.exec(`delete from settings where user_id = '${U5}'`);
  await asUser(U5, async (q) => {
    let r = await q(`select start_session(now(), ${TODAY})`);
    check('E56 start_session sin settings: error claro', has(r, 'Falta la configuracion'), JSON.stringify(r));
    r = await q(`select set_goal_completed('${g1}', ${TODAY})`);
    check('E57 set_goal_completed sin settings: error claro', has(r, 'Falta la configuracion'), JSON.stringify(r));
  });
  await db.exec(`insert into settings (user_id) values ('${U5}')`);
}

async function suitePrivileges() {
  console.log('F. permisos de ejecucion (catalogo)');
  const q = async (sql) => (await db.query(sql)).rows;
  const pub = ['start_session(timestamptz,date)','finish_session(uuid,int,uuid[])','create_manual_session(timestamptz,date,int,uuid[])',
    'edit_session(uuid,timestamptz,date,int)','discard_session(uuid)','set_goal_completed(uuid,date)','unset_goal_completed(uuid)',
    'edit_completion_date(uuid,date)','is_my_student(uuid)','is_my_teacher(uuid)'];
  const internal = ['student_today()','assert_student()','check_session_start(timestamptz,date)','handle_new_user()','validate_settings_timezone()'];
  for (const f of pub) {
    const [a] = await q(`select has_function_privilege('anon','${f}','execute') as v`);
    const [b] = await q(`select has_function_privilege('authenticated','${f}','execute') as v`);
    check(`F1 ${f}: anon NO, authenticated SI`, a.v === false && b.v === true, `(anon=${a.v}, auth=${b.v})`);
  }
  for (const f of internal) {
    const [a] = await q(`select has_function_privilege('anon','${f}','execute') as v`);
    const [b] = await q(`select has_function_privilege('authenticated','${f}','execute') as v`);
    check(`F2 ${f}: ni anon ni authenticated`, a.v === false && b.v === false, `(anon=${a.v}, auth=${b.v})`);
  }
  const cols = await q(`select grantee, table_name, column_name, privilege_type
    from information_schema.column_privileges
    where table_schema='public' and grantee in ('anon','authenticated') and privilege_type in ('INSERT','UPDATE')
    order by 1,2,4,3`);
  const anonW = cols.filter(c => c.grantee === 'anon');
  check('F3 anon sin INSERT/UPDATE en ninguna columna', anonW.length === 0, JSON.stringify(anonW.slice(0, 3)));
  const goalsUpd = cols.filter(c => c.grantee === 'authenticated' && c.table_name === 'goals' && c.privilege_type === 'UPDATE').map(c => c.column_name).sort();
  check('F4 UPDATE en goals solo title, est_minutes, position, archived_at',
    JSON.stringify(goalsUpd) === JSON.stringify(['archived_at','est_minutes','position','title']), JSON.stringify(goalsUpd));
  const tablesW = cols.filter(c => c.grantee === 'authenticated').map(c => c.table_name);
  check('F5 authenticated no tiene escritura en study_sessions/profiles/teacher_students/suggestions',
    !tablesW.some(t => ['study_sessions','profiles','teacher_students','suggestions'].includes(t)), JSON.stringify([...new Set(tablesW)]));
  const rls = await q(`select relname, relrowsecurity from pg_class where relnamespace='public'::regnamespace and relkind='r' order by 1`);
  check('F6 RLS activo en las 7 tablas', rls.length === 7 && rls.every(r => r.relrowsecurity), JSON.stringify(rls));
}

async function runAll(label) {
  console.log(`\n===== ${label} =====`);
  await suiteTrigger();
  await suiteAnon();
  await suiteStudentDirect();
  await suiteTeacher();
  await suiteRPC();
  await suitePrivileges();
}

const read = (f) => fs.readFileSync(`${SQL_DIR}/${f}`, 'utf8');

try {
  await setupMock();
  await db.exec(read('01_tables.sql'));
  await db.exec(read('02_functions.sql'));
  await db.exec(read('03_rls.sql'));
  console.log('01, 02 y 03 se ejecutaron sin errores');
  await seed();
  await runAll('PRIMERA EJECUCION');

  // re-ejecutar (idempotencia): constraints/indices de 01 + 02 + 03 completos
  const t = read('01_tables.sql');
  const marker = '-- Ajustes de tablas (constraints e indices) - re-ejecutable';
  const idx = t.indexOf(marker);
  await db.exec(t.slice(idx));
  await db.exec(read('02_functions.sql'));
  await db.exec(read('03_rls.sql'));
  console.log('\nre-ejecucion de 01 (parte re-ejecutable), 02 y 03: sin errores');
  await runAll('DESPUES DE RE-EJECUTAR');
} catch (e) {
  console.log('ERROR FATAL:', e.message, e.code ?? '');
  if (e.position) console.log('position', e.position);
  fail++;
}

console.log(`\nRESULTADO: ${pass} ok, ${fail} fallos`);
if (failures.length) console.log([...new Set(failures)].join('\n'));
