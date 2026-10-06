# Backlog RetailHub

Fuente de trabajo del loop de iteración (`/iterar`, skill `retailhub-iterate`).

## Cómo funciona

- **Estados:** `todo` → `in-progress` → `done` (con fecha y hash) | `blocked` (con motivo).
- **Prioridades:** `P0` habilitante del loop · `P1` alto impacto · `P2` mejora sólida · `P3` nice to have.
- **Selección:** el loop toma el `todo` con prioridad más baja; en empate, el primero en el archivo.
- **`[requiere decisión]`:** no se implementa sin aprobación explícita del usuario (regla de `AGENTS.md`).
- Una iteración = un ítem = un commit. Al terminar: `done` + hash, y las ideas nuevas se agregan acá.

## Ítems

### FEAT-01 · Endpoint `GET /api/health`

- **Categoría:** Feature
- **Prioridad:** P0
- **Estado:** done (2026-10-05, `d21565b`)
- **Descripción:** endpoint público (sin auth) para readiness de QA y automatización.
- **Aceptación:** responde `200 { "status": "ok", "timestamp": "<ISO>" }` sin token, sin datos sensibles; `scripts/smoke.mjs` lo verifica.

### UX-01 · Tokens de diseño en CSS

- **Categoría:** UX
- **Prioridad:** P1
- **Estado:** todo
- **Descripción:** definir variables en `:root` (colores, radios, espaciado) y reemplazar literales de `client/src/styles.css`.
- **Aceptación:** sin cambios visuales perceptibles; `typecheck` y `build` verdes.

### UX-02 · Estados de controles

- **Categoría:** UX
- **Prioridad:** P1
- **Estado:** todo
- **Descripción:** `:hover`, `:focus-visible` y `:disabled` consistentes en botones, links y filas; foco visible por teclado.
- **Aceptación:** navegación con Tab muestra foco claro; botones deshabilitados se distinguen.

### UX-03 · Accesibilidad de formularios

- **Categoría:** UX
- **Prioridad:** P1
- **Estado:** todo
- **Descripción:** `<label htmlFor>` en todos los inputs, `role="alert"` en errores del client.
- **Aceptación:** ningún input queda solo con placeholder; errores anunciados a lectores de pantalla.

### ERR-01 · Error tipado en el client

- **Categoría:** Errores
- **Prioridad:** P1
- **Estado:** todo
- **Descripción:** que `api()` conserve `status` y `code` del servidor (clase `ApiError` propia) para mensajes contextuales.
- **Aceptación:** las páginas siguen mostrando el mensaje; el código está disponible programáticamente.

### ERR-02 · Manejo global de 401

- **Categoría:** Errores
- **Prioridad:** P1
- **Estado:** todo
- **Descripción:** ante 401 (token vencido/inválido) limpiar token y volver a login.
- **Aceptación:** request con token vencido desloguea sin pantalla rota.

### UX-04 · Estados de carga y vacío

- **Categoría:** UX
- **Prioridad:** P2
- **Estado:** todo
- **Descripción:** deshabilitar botones durante requests y mostrar mensajes de lista vacía en las 5 páginas.
- **Aceptación:** sin doble submit; listas vacías muestran texto claro.

### UX-05 · Responsive básico

- **Categoría:** UX
- **Prioridad:** P2
- **Estado:** todo
- **Descripción:** nav que envuelve, tablas con scroll horizontal, card a ancho completo en mobile.
- **Aceptación:** usable a 375px de ancho.

### ERR-03 · Ruta 404 del client

- **Categoría:** Errores
- **Prioridad:** P2
- **Estado:** todo
- **Descripción:** página `NotFound` para URLs desconocidas con link a Productos.
- **Aceptación:** URL inexistente no muestra pantalla en blanco.

### ERR-04 · Fallback JSON 404 de API

- **Categoría:** Errores
- **Prioridad:** P2
- **Estado:** todo
- **Descripción:** handler para rutas `/api/*` inexistentes.
- **Aceptación:** `GET /api/inexistente` → `404 { "error": { "code": "NOT_FOUND", "message": ... } }`.

### ERR-05 · Mapeo de errores Prisma

- **Categoría:** Errores
- **Prioridad:** P2
- **Estado:** todo
- **Descripción:** mapear `P2025` → 404 y `P2003` → 409 en `errorHandler`.
- **Aceptación:** cubierto por smoke; sin filtrar detalles internos.

### FEAT-02 · Paginación de listados

- **Categoría:** Feature
- **Prioridad:** P2
- **Estado:** todo
- **Descripción:** `?page=&pageSize=` en productos, movimientos y órdenes; controles en la UI.
- **Aceptación:** contratos actualizados en `scripts/smoke.mjs`; UI navegable.

### FEAT-03 · Filtros de movimientos

- **Categoría:** Feature
- **Prioridad:** P2
- **Estado:** todo
- **Descripción:** filtrar movimientos por producto, tipo y rango de fechas.
- **Aceptación:** endpoint validado con zod + UI; smoke actualizado.

### FEAT-04 · Búsqueda de órdenes

- **Categoría:** Feature
- **Prioridad:** P2
- **Estado:** todo
- **Descripción:** búsqueda/filtro por estado y usuario en el listado de órdenes.
- **Aceptación:** endpoint + UI; smoke actualizado.

### TECH-01 · CI en GitHub Actions `[requiere decisión]`

- **Categoría:** Técnica
- **Prioridad:** P2
- **Estado:** todo
- **Descripción:** workflow con `npm ci`, typecheck, build y smoke.

### TECH-02 · Base de tests `[requiere decisión]`

- **Categoría:** Técnica
- **Prioridad:** P2
- **Estado:** todo
- **Descripción:** Vitest + Supertest (server) y Testing Library (client).

### UX-06 · Debounce de búsqueda de productos

- **Categoría:** UX
- **Prioridad:** P3
- **Estado:** todo
- **Descripción:** evitar un request por tecla en `Products.tsx`.
- **Aceptación:** menos requests al tipear, mismos resultados.

### ERR-06 · ErrorBoundary

- **Categoría:** Errores
- **Prioridad:** P3
- **Estado:** todo
- **Descripción:** fallback de React ante errores de render.

### ERR-07 · Errores por campo

- **Categoría:** Errores
- **Prioridad:** P3
- **Estado:** todo
- **Descripción:** mostrar detalle de validación zod por campo (si el contrato lo expone).

### FEAT-05 · Perfil y cambio de contraseña

- **Categoría:** Feature
- **Prioridad:** P3
- **Estado:** todo
- **Descripción:** ver datos del usuario y cambiar contraseña con validación.

### FEAT-06 · Motivo en movimientos de inventario

- **Categoría:** Feature
- **Prioridad:** P3
- **Estado:** todo
- **Descripción:** campo opcional de motivo/comentario (requiere migración).

### FEAT-07 · Métricas básicas

- **Categoría:** Feature
- **Prioridad:** P3
- **Estado:** todo
- **Descripción:** totales de productos, unidades en stock y productos bajo umbral.

### TECH-03 · Lint y formato `[requiere decisión]`

- **Categoría:** Técnica
- **Prioridad:** P3
- **Estado:** todo
- **Descripción:** ESLint + Prettier con scripts en la raíz.

### TECH-04 · Validación de entorno al arranque

- **Categoría:** Técnica
- **Prioridad:** P3
- **Estado:** todo
- **Descripción:** validar `DATABASE_URL`, `JWT_SECRET` y `PORT` con zod al iniciar el server.
