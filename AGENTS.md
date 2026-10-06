# AGENTS.md

Monorepo RetailHub: producto base para un Quality Engineering Lab.

## Stack

- `server/`: Node.js + TypeScript + Express + Prisma + PostgreSQL (REST API, puerto 3001)
- `client/`: React + TypeScript + Vite (puerto 5173)
- Infra local: Docker Compose (PostgreSQL 16, puerto 5432)
- npm workspaces. Monorepo intencional; no separar.

## Comandos

```bash
npm install          # instalar todo
npm run db:up        # levantar PostgreSQL
cp .env.example .env # configurar entorno (copiar a server/.env también)
npm run db:migrate   # aplicar migraciones
npm run db:seed      # datos iniciales (usuarios + productos)
npm run dev          # server + client en paralelo
npm run typecheck    # typecheck de ambos paquetes
npm run build        # build de ambos paquetes
```

Credenciales seed: `admin@retailhub.dev` / `admin123`, `operator@retailhub.dev` / `operator123`.

## Reglas de negocio (resumen)

- Solo `admin` crea/edita productos; SKU único (409 si duplicado).
- Stock nunca negativo; todo movimiento registra usuario, tipo y cantidad.
- Órdenes: cantidad entera > 0; al confirmar se descuenta stock en transacción (todo o nada); cancelar una orden CONFIRMED repone stock.
- Errores API: `{ "error": { "code", "message" } }`.

## Convenciones

- Commits: ver [docs/commit.md](docs/commit.md).
- Validación de entrada con zod en el servidor.
- Lógica de negocio en `server/src/services/`, rutas en `routes/`, middleware de auth/rol en `middleware/`.
- No agregar microservicios, colas, cache, cloud ni IA sin decisión explícita del usuario.

## Iteración automática y QA

- Skills del proyecto en `.opencode/skills/`: `retailhub-ux` (UI/UX), `retailhub-features` (módulos), `retailhub-errors` (errores), `retailhub-qa` (auditoría + smoke), `retailhub-iterate` (protocolo de iteración).
- `/iterar [ux|feature|error]` ejecuta una iteración completa: toma un ítem de `docs/backlog.md`, implementa, pasa QA, commitea y actualiza el backlog. `/qa` corre solo la auditoría. Una iteración = un ítem = un commit de código (el backlog se actualiza en un commit `docs:` aparte).
- `docs/backlog.md` es la fuente de trabajo priorizada. Los ítems `[requiere decisión]` no se tocan sin aprobación del usuario.
- `npm run smoke` (o `node scripts/smoke.mjs`) verifica la API contra `http://localhost:3001`: auth, roles, productos, stock y órdenes.
- Automatización Orca "RetailHub iteración": diaria 09:00, provider `opencode`, sobre el worktree `silverside`. Corre una iteración desatendida y commitea en la rama actual, sin push.
- Permisos del proyecto en `.opencode/opencode.json`: edición y bash permitidos para poder correr desatendido, con red de denies (push, amend, reset, restore, rm, publicaciones). Aplica también a sesiones interactivas de este worktree.
