# sql/tests · Pruebas de la base de datos

Ejecutan los archivos `01_tables.sql`, `02_functions.sql` y `03_rls.sql` en un
**Postgres local en memoria** ([PGlite](https://pglite.dev)) que simula lo que Supabase
agrega: los roles `anon` / `authenticated`, `auth.users` y `auth.uid()`.
No tocan tu proyecto de Supabase ni necesitan internet después de instalar.

## Cómo correrlas

```bash
cd sql/tests
pnpm install
pnpm test
```

Al final imprime `RESULTADO: N ok, 0 fallos`. Si algo falla, muestra el nombre de la prueba.
Para apuntar a otra carpeta de SQL: `pnpm test ruta/a/sql` (o `node run_tests.mjs ruta/a/sql`).

Agrega `node_modules/` a tu `.gitignore` si todavía no lo tienes.

## Qué cubren

| Grupo | Qué verifica                                                                                               |
| ----- | ---------------------------------------------------------------------------------------------------------- |
| A     | Trigger de alta: perfiles, `settings` solo para estudiantes, rol inválido pasa a `student`                 |
| B     | `anon` no lee ninguna tabla ni ejecuta funciones                                                           |
| C     | Estudiante: no escribe directo, ve solo lo suyo, validaciones de `settings`, funciones internas bloqueadas |
| D     | Profesor: edita solo el plan de su estudiante, no toca el progreso, no ve a quien no es suyo               |
| E     | Las 8 RPC: casos felices, rechazos, atomicidad, fechas, zona horaria, sesiones ajenas                      |
| F     | Catálogo: permisos de ejecución, escritura por columna y RLS activo en las 7 tablas                        |

Todo se ejecuta **dos veces**: tras la primera corrida se re-ejecutan `02` y `03` para
comprobar que son idempotentes y que los permisos quedan igual.

## Cómo agregar una prueba

Usa `asUser(uid, async (q) => { ... })`: simula a ese usuario (`set local role authenticated`

- `request.jwt.claims`), y cada `q(sql)` corre dentro de un `savepoint`, así un error esperado
  no aborta el resto. Devuelve `{ ok, rows, n }` o `{ ok: false, msg, code }`.
  Todo lo que hace `asUser` se revierte al terminar (`rollback`).

```js
const r = await q(`select set_goal_completed('${g1}', ${TODAY})`);
check("mi prueba", r.ok);
```

## Limitaciones

PGlite no es Supabase: simula los roles y `auth.uid()`, pero no cubre PostgREST, el JWT real,
ni los permisos por defecto de tu proyecto. Úsalas como red de seguridad al cambiar el SQL,
y repite las pruebas críticas en Supabase real antes de dar algo por cerrado.
