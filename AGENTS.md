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
