# sql/ · Base de datos de Nudge (Supabase / Postgres)

Estado actual del esquema, las funciones y la seguridad. Cada archivo se ejecuta
en el **SQL Editor** de Supabase, en este orden:

| #   | Archivo            | Qué contiene                                                              | ¿Re-ejecutable?                                                                       |
| --- | ------------------ | ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| 1   | `01_tables.sql`    | Las 7 tablas, constraints extra e índices                                 | Solo la última sección ("Ajustes de tablas"); los `create table` fallan si ya existen |
| 2   | `02_functions.sql` | Funciones auxiliares, RPC del estudiante, triggers, permisos de ejecución | Sí                                                                                    |
| 3   | `03_rls.sql`       | Políticas RLS y `grant` por tabla / columna                               | Sí                                                                                    |

**Por qué ese orden:** las políticas de `03` usan `is_my_student` / `is_my_teacher`,
que se definen en `02`; y las funciones necesitan que existan las tablas de `01`.

## Si ya tienes la base creada

- De `01_tables.sql` ejecuta **solo desde** el comentario
  `-- Ajustes de tablas (constraints e indices) - re-ejecutable` hacia abajo.
- Ejecuta `02_functions.sql` y `03_rls.sql` completos.

## Cuentas creadas antes del trigger

El trigger `on_auth_user_created` crea `profiles` y `settings` al registrarse. Las cuentas
de prueba que se crearon **antes** de tenerlo no tienen esas filas, y las RPC fallarán con
"Falta la configuracion del estudiante (settings)". Para repararlas:

```sql
insert into profiles (id, role, display_name)
select id, 'student', split_part(email, '@', 1)
from auth.users
where id not in (select id from profiles);

-- si alguna cuenta debe ser profesor:
-- update profiles set role = 'teacher' where id = '<UUID>';

insert into settings (user_id)
select id from profiles where role = 'student'
on conflict do nothing;
```

## Modelo de seguridad (resumen)

- **El rol vive en `profiles.role`.** Se lee de `user_metadata` solo al registrarse.
- **El estudiante no escribe directamente** en `tasks`, `goals` ni `study_sessions`:
  todo pasa por RPC (`security definer`) que validan propiedad con `auth.uid()`.
- **El profesor** edita el plan (`title`, `est_minutes`, `position`, `archived_at`) de
  tareas y metas de su estudiante activo; **no puede** tocar `completed_on` ni `session_id`
  (lo impide el `grant` por columnas) y no tiene `delete` (se archiva).
- **`anon` no tiene acceso** a ninguna tabla ni RPC.
- Funciones **internas** (`student_today`, `assert_student`, `check_session_start`,
  funciones de trigger) no son ejecutables desde la API.

## RPC del estudiante

| Función                                                               | Qué hace                                                              |
| --------------------------------------------------------------------- | --------------------------------------------------------------------- |
| `start_session(started_at, local_date)`                               | Abre una sesión (una sola abierta a la vez)                           |
| `finish_session(session_id, duration, goal_ids[])`                    | Cierra la sesión y marca las metas, atómico                           |
| `create_manual_session(started_at, local_date, duration, goal_ids[])` | Sesión ya cerrada                                                     |
| `edit_session(session_id, started_at, local_date, duration)`          | Corrige una sesión **cerrada** y mueve el `completed_on` de sus metas |
| `discard_session(session_id)`                                         | Borra una sesión **abierta** (abandonada)                             |
| `set_goal_completed(goal_id, date)`                                   | Marca una meta pendiente fuera de sesión                              |
| `unset_goal_completed(goal_id)`                                       | Desmarca (limpia `completed_on` y `session_id`)                       |
| `edit_completion_date(goal_id, date)`                                 | Cambia la fecha de una meta completada **fuera de sesión**            |

Las de sesión validan que `started_at` no sea futuro (tolerancia de 5 min) y que
`local_date` coincida con `started_at` **en la zona horaria de `settings.timezone`**.

## Importante para el cliente (React)

`local_date` debe calcularse con la **zona de `settings.timezone`**, no con la del navegador.
Si no coinciden (viaje, navegador mal configurado), la RPC rechaza la sesión. Con `date-fns-tz`:

```ts
import { formatInTimeZone } from "date-fns-tz";
const localDate = formatInTimeZone(startedAt, settings.timezone, "yyyy-MM-dd");
```

Lo mismo para el "hoy" de la app (`diaActivo()`).

## Convenciones

- Estado actual, no historial: mientras solo haya datos de prueba se editan estos archivos.
  Cuando haya datos reales, los cambios van en archivos nuevos (`04_...`, `05_...`).
- Nada secreto aquí: sin claves ni correos reales.
- Mensajes de error de las RPC sin tildes a propósito (evita problemas de codificación).

## Pendiente

- Triggers: bloquear el borrado físico y el cambio de `est_minutes` en metas completadas.
- Invitación y aceptación profesor-estudiante (`teacher_students`): hoy las filas se crean a mano.
- Políticas de `suggestions` (hoy la tabla está cerrada).
- `edit_session` está probada con datos de prueba, pero conviene repetir sus casos en Supabase real.
