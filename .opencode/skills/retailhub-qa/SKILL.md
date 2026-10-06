---
name: retailhub-qa
description: Audita la calidad de RetailHub: reglas de negocio, smoke tests de API, typecheck/build, revisión de diff y de UI. Úsala cuando se pida QA, "revisar todo", auditar, verificar antes de commitear, o como paso final de una iteración.
---

# RetailHub QA

Auditoría completa del estado del repo. **No corrige**: detecta, evidencia y reporta; las correcciones vuelven al flujo de `retailhub-iterate`.

## Cuándo usarla

- "QA", "revisar todo", "auditar", "verificar calidad", "¿está listo para commit?".
- Fase de verificación de `retailhub-iterate`.

## 0. Precondiciones y bootstrap

1. `git status --short` y `git diff` para saber qué se está auditando.
2. Verificar que existan `.env` y `server/.env`; si faltan, crearlos desde `.env.example` (no commitearlos).
3. `npm install` si falta `node_modules`.
4. Docker corriendo y base arriba: `docker ps` → si no está, `npm run db:up` y esperar healthy.
5. `npx prisma migrate deploy -w server` y `npm run db:seed` (seed es idempotente; requiere `server/.env`).
6. Levantar la API en segundo plano y esperar readiness:
   - Elegir puerto: si `netstat -ano | findstr :3001` no devuelve nada, usar `3001`; si está ocupado (puede ser otro worktree), usar `3101` y anotarlo en el reporte.
   - `PORT=<puerto> npm run dev -w server > /tmp/retailhub-server.log 2>&1 & echo $!` (guardar el PID).
   - Esperar hasta que `curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost:<puerto>/api/auth/login -H "Content-Type: application/json" -d '{"email":"admin@retailhub.dev","password":"admin123"}'` devuelva `200` (reintentar ~15 veces con 1s de espera).
   - Si no arranca por `EADDRINUSE`, elegir otro puerto libre (3201, …) y reintentar; si sigue fallando, reportar y detener la auditoría.
   - Nunca matar procesos ajenos: solo detener el PID que levantó QA al final. Nunca asumir que un 3001 ocupado sirve el código actual.

## 1. Smoke tests de API

Ejecutar la suite del repo contra el puerto elegido:

```bash
node scripts/smoke.mjs                                   # puerto 3001
API_URL=http://localhost:3101 node scripts/smoke.mjs     # puerto alternativo
```

Cubre: login admin/operator, 401 sin token, 403 por rol, validación 400, SKU duplicado 409, movimientos IN/OUT, stock insuficiente 409, alta/confirmación/cancelación de órdenes con verificación de stock, doble confirmación 409, cancelación doble 409, 404 de orden inexistente, y forma uniforme de los errores. Sale con código ≠ 0 si algo falla.

Si `scripts/smoke.mjs` no existe o quedó desactualizado respecto de un contrato nuevo, **eso es un hallazgo** y hay que reportarlo (y proponer actualizarlo en la iteración).

Casos puntuales que la suite no cubra: probar con `curl` y validar status + `error.code`.

## 2. Verificación estática

- `npm run typecheck` (raíz) y `npm run build` (raíz). Ambos deben pasar.
- Revisar el diff contra las reglas de negocio de `AGENTS.md` (stock no negativo, transacciones todo-o-nada, roles, SKU único, total server-side).
- Buscar secretos en el diff (`.env`, tokens, passwords hardcodeados fuera del seed).
- Consistencia: formato `{ error: { code, message } }`, códigos estables, mensajes en español.
- Prohibiciones de `AGENTS.md`: microservicios, colas, cache, cloud, IA, dependencias nuevas sin justificar.

## 3. Revisión de UI (si el cambio toca client)

1. Si QA usó un puerto alternativo para la API, el proxy de Vite sigue apuntando a `3001`: verificar visualmente igual y anotar que los datos de API pueden venir de otra instancia.
2. Con server y client corriendo (`npm run dev`), abrir con Orca:
   - `orca tab create --url http://localhost:5173 --json`
   - `orca snapshot` / `orca screenshot --format png`
2. Login (`admin@retailhub.dev` / `admin123`) y recorrer las páginas afectadas.
3. Verificar: el cambio se ve, no hay pantallas en blanco, los errores se muestran, los estados vacíos/carga aparecen.
4. Anotar problemas de contraste, foco, labels o responsive como hallazgos.

## 4. Reporte (formato obligatorio)

```
## Reporte QA — <fecha> — <commit o "working tree">

Veredicto: APROBADO | APROBADO CON OBSERVACIONES | RECHAZADO

### Cobertura ejecutada
- [x] Smoke API (N casos, X pass / Y fail)
- [x] typecheck / build
- [x] Revisión de diff vs reglas de negocio
- [ ] UI (motivo si no aplica)

### Hallazgos
| # | Severidad | Descripción | Evidencia | Archivo |
|---|-----------|-------------|-----------|---------|
| 1 | Blocker/Major/Minor/Nit | ... | salida/código | ruta:línea |

### Datos de entrada
- ...
```

Criterios del veredicto:

- **RECHAZADO** si hay algún Blocker (regla de negocio rota, smoke en rojo, typecheck/build falla, secreto expuesto).
- **APROBADO CON OBSERVACIONES** si solo hay Major/Minor/Nit sin impacto funcional.
- **APROBADO** si no hay hallazgos o solo Nits triviales.

## 5. Limpieza

- Detener la API que levantó QA (`kill <pid>`), salvo que la haya levantado el flujo de iteración.
- Dejar la base arriba. No borrar volúmenes ni datos.