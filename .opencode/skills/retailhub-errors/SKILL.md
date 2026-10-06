---
name: retailhub-errors
description: Mejora el manejo y la presentación de errores en RetailHub (servidor y cliente). Úsala cuando se pida mejorar mensajes de error, validaciones, manejo de 401/404, resiliencia, feedback de fallos o consistencia de códigos de error.
---

# RetailHub Errores

## Cuándo usarla

- Pedidos como "mejorar los errores", "mensajes de error", "validación", "resiliencia", "se rompe y no avisa", "token vencido".
- Iteraciones de `retailhub-iterate` con un ítem de categoría **Errores** en `docs/backlog.md`.

## Estado actual

**Server**

- Formato único: `{ "error": { "code": "CODE", "message": "texto" } }`.
- `ApiError(status, code, message)` en `server/src/lib/errors.ts`; `asyncHandler` captura promesas rechazadas.
- `errorHandler` (`server/src/middleware/errorHandler.ts`): ZodError → `400 VALIDATION_ERROR`, `ApiError` → su status, Prisma `P2002` → `409 CONFLICT`, resto → `500 INTERNAL` (hace `console.error`).
- Códigos en uso: `VALIDATION_ERROR`, `INVALID_CREDENTIALS`, `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`, `DUPLICATE_SKU`, `CONFLICT`, `INSUFFICIENT_STOCK`, `INVALID_STATE`, `INTERNAL`.
- No hay handler de rutas API inexistentes ni mapeo de otros errores Prisma (`P2025`, etc.).

**Client**

- `api()` (`client/src/api/client.ts`) lanza `Error(body.error.message)`; no expone el `code`.
- Cada página guarda el mensaje en `<p className="error">{err.message}</p>`, sin `role="alert"`, sin manejo global de 401 (token vencido deja la UI "logueada" con requests fallando), sin ruta 404 y sin errores por campo.
- `server/src/middleware/auth.ts` responde 401 si el token falta o es inválido; el client no reacciona (no hace logout).

## Playbook

**Server**

- Mapear errores Prisma conocidos a códigos de dominio (`P2025` → `404 NOT_FOUND`, `P2003` → `409 CONFLICT`).
- Agregar fallback JSON 404 para `/api/*` (después de montar rutas, antes del `errorHandler`).
- No filtrar stack traces ni detalles internos al cliente; loguear del lado servidor.
- Validar también `query`/`params` con zod cuando el endpoint los use.

**Client**

- Helper de errores tipado (por ejemplo `ApiError { status, code, message }`) que conserve el código del servidor.
- Interceptor global de 401: limpiar token y volver a login.
- Mensajes accionables y en español; `role="alert"` en el contenedor de error.
- Ruta 404 de cliente y ErrorBoundary para errores de render.
- Errores por campo reutilizando mensajes de zod (solo si el contrato expone detalles).

## Proceso y verificación

1. Identificar el ítem del backlog y los casos que cubre.
2. Implementar el cambio mínimo.
3. Verificar con casos negativos reales (`curl`), al menos:
   - Login inválido → `401 INVALID_CREDENTIALS`.
   - Producto sin token → `401 UNAUTHORIZED`.
   - `POST /api/products` con `price: -1` → `400 VALIDATION_ERROR`.
   - SKU duplicado → `409 DUPLICATE_SKU`.
   - `OUT` mayor al stock → `409 INSUFFICIENT_STOCK`.
   - Confirmar orden ya confirmada → `409 INVALID_STATE`.
   - Orden inexistente → `404 NOT_FOUND`.
4. `npm run typecheck` y `npm run build`; si tocó casos cubiertos, `node scripts/smoke.mjs`.
5. Revisar la UI del caso de error con el browser de Orca si aplica.

## Reglas

- Mensajes en español, claros para el usuario final; códigos estables y en MAYÚSCULAS.
- No mostrar `err.stack`, SQL ni rutas internas al cliente.
- No cambiar códigos existentes sin actualizar `scripts/smoke.mjs` y los consumidores del client.
- Un cambio de errores por iteración.

## Commit

`fix(server|client): ...` o `feat(server|client): ...` según `docs/commit.md`.
