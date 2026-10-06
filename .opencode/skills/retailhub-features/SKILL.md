---
name: retailhub-features
description: Agrega o mejora funcionalidades de los módulos de RetailHub (productos, inventario, órdenes, auth) en server y client. Úsala cuando la iteración pida complejizar el producto, sumar un endpoint, campo, filtro, paginación, búsqueda o comportamiento nuevo.
---

# RetailHub Features

## Cuándo usarla

- Pedidos como "agregar funcionalidad", "complejizar", "mejorar el módulo de X", "nuevo endpoint", "paginación", "filtros".
- Iteraciones de `retailhub-iterate` con un ítem de categoría **Feature** en `docs/backlog.md`.

## Mapa de módulos

| Módulo | Server | Client |
| --- | --- | --- |
| Auth | `server/src/routes/auth.ts`, `server/src/middleware/auth.ts` | `client/src/auth/AuthContext.tsx`, `client/src/api/client.ts` |
| Productos | `server/src/routes/products.ts` → `server/src/services/products.ts` | `client/src/pages/Products.tsx` |
| Inventario | `server/src/routes/inventory.ts` → `server/src/services/inventory.ts` | `client/src/pages/Inventory.tsx` |
| Órdenes | `server/src/routes/orders.ts` → `server/src/services/orders.ts` | `client/src/pages/{Orders,NewOrder,OrderDetail}.tsx` |

- Modelos Prisma: `server/prisma/schema.prisma`. Seed: `server/prisma/seed.ts`.
- Montaje de rutas: `server/src/app.ts`. Errores: `server/src/lib/errors.ts` + `server/src/middleware/errorHandler.ts`.

## Reglas de negocio (no romper)

1. Solo `admin` crea/edita productos. SKU duplicado → `409 DUPLICATE_SKU`.
2. Stock nunca negativo. Todo movimiento registra usuario, tipo (`IN`/`OUT`) y cantidad.
3. Órdenes con cantidades enteras > 0; el total se calcula en el servidor con precios actuales.
4. Confirmar una orden es todo o nada: valida stock de todos los ítems en una transacción.
5. Cancelar una orden `CONFIRMED` repone stock con movimientos `IN`.
6. Una orden `CANCELLED` no se confirma; una `CONFIRMED` no se cancela dos veces ni se edita.
7. Errores de API siempre `{ "error": { "code", "message" } }`.

## Flujo

1. Tomar el ítem del backlog y definir el contrato: método + ruta, body/query con zod, respuestas y códigos de error.
2. **Server**: validar con zod en la ruta, lógica en `services/`, errores con `throw new ApiError(status, "CODE", "mensaje")`. Usar `prisma.$transaction` si toca stock o dinero.
3. **Client**: llamar con `api()` de `client/src/api/client.ts`; manejar estados de carga y error en la página.
4. **Prisma**: si cambia el modelo, editar `schema.prisma` y correr `npm run db:migrate -w server -- --name <nombre_descriptivo>`.
5. **Verificación**: `npm run typecheck`, `npm run build`, y smoke de lo tocado (`curl` o `node scripts/smoke.mjs`). Actualizar `scripts/smoke.mjs` si cambia un contrato existente.
6. Documentar en `README.md` si es una funcionalidad visible para el usuario.
7. Commit con `feat(server|client|db): ...` según `docs/commit.md`.

## Guardrails

- Prohibido sin decisión explícita del usuario: microservicios, colas, cache, cloud, IA, frameworks nuevos.
- Sin dependencias nuevas salvo justificación clara en el reporte de la iteración.
- No cambiar la forma de `{ error: { code, message } }` ni los códigos existentes sin actualizar `scripts/smoke.mjs`.
- No commitear `.env` ni secretos.
