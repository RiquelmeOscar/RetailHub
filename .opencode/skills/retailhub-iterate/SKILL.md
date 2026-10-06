---
name: retailhub-iterate
description: Ejecuta una iteración completa y desatendible de RetailHub: elige un ítem del backlog, lo implementa, lo pasa por QA, commitea y actualiza el backlog. Úsala con "iterar", "loop", "ejecución automática", "avanzar el backlog" o cuando una automatización dispare una iteración.
---

# RetailHub Iteración

Protocolo para mejorar el proyecto de a **una** mejora pequeña por iteración. Es el orquestador de `retailhub-ux`, `retailhub-features`, `retailhub-errors` y `retailhub-qa`.

## Regla de oro

Una iteración = un ítem del backlog = un commit. Si el ítem crece demasiado, reducirlo y dejar el resto como ítem nuevo.

## Fase 0 — Precondiciones

1. `git status --short`: si hay cambios sin commitear ajenos a la iteración, **no empezar**; reportar y salir.
2. Asegurar entorno: `.env` y `server/.env` (copiar de `.env.example` si faltan), `npm install` si falta `node_modules`, `docker ps` + `npm run db:up` si la base no está.
3. `npx prisma migrate deploy -w server` y `npm run db:seed`.

## Fase 1 — Selección

1. Leer `docs/backlog.md`.
2. Elegir el ítem `todo` con prioridad más baja (P0 < P1 < P2 < P3); en empate, el primero en el archivo.
3. Nunca elegir ítems marcados `[requiere decisión]` salvo que el pedido lo indique explícitamente.
4. Si el pedido o `$ARGUMENTS` indica categoría o ítem, respetarlo.
4. Marcar el ítem como `in-progress` antes de tocar código.
5. Si el backlog no tiene ítems `todo`, proponer 3 ítems nuevos (uno por categoría) y detenerse sin commitear.

## Fase 2 — Implementación

Invocar la skill según la categoría del ítem:

- UX → `retailhub-ux`
- Feature → `retailhub-features`
- Error → `retailhub-errors`

Seguir sus reglas y su definición de terminado. Mantener el diff acotado (cambio pequeño y revisable).

## Fase 3 — QA

Ejecutar `retailhub-qa` sobre el cambio (smoke, typecheck, build, revisión de diff y UI si aplica).

- Si el veredicto es **APROBADO** o **APROBADO CON OBSERVACIONES** (sin Major/Blocker): continuar.
- Si es **RECHAZADO**: corregir y repetir QA. Máximo 2 ciclos de corrección.
- Si tras 2 ciclos sigue rechazado: `git restore` de los archivos **propios de la iteración** (nunca de trabajo ajeno), marcar el ítem como `blocked` con el motivo y el hallazgo principal, y terminar sin commit.

## Fase 4 — Commit y cierre

1. Revisar `git status` y `git diff --staged`: stagear solo los archivos de la iteración.
2. Commit siguiendo `docs/commit.md` (Conventional Commits, descripción imperativa en español, ≤72 caracteres). Nunca `--amend`, nunca `push`.
3. Actualizar `docs/backlog.md`:
   - Ítem trabajado → `done` con fecha y hash corto del commit.
   - Nuevas ideas o deuda detectada → agregar ítems `todo` con categoría y prioridad.
   - Si se tocó un contrato de API, verificar que `scripts/smoke.mjs` quedó coherente.
4. Commit de la actualización del backlog: `docs: actualizar backlog tras iteración` (si quedó fuera del commit anterior).
5. Reporte final de 2-4 líneas: ítem, qué cambió, resultado de QA, hash.

## Manejo de fallos en modo desatendido

- Docker/DB no disponibles, `npm install` roto o migraciones fallando: reportar causa exacta, no tocar código, no commitear, salir con estado limpio.
- Nunca dejar procesos de servidor corriendo al terminar (matar el PID que levantó la iteración).
- No instalar dependencias nuevas sin justificación explícita en el reporte.
- No modificar `AGENTS.md`, `docs/commit.md` ni `.opencode/` salvo que el ítem lo pida.

## Guardrails globales (de `AGENTS.md`)

- Sin microservicios, colas, cache, cloud ni IA sin decisión explícita del usuario.
- Nunca commitear `.env` ni secretos. Nunca `git push`, `--amend`, `reset --hard` ni `checkout`/`switch` de rama.
- Los errores de API se mantienen como `{ error: { code, message } }`.
