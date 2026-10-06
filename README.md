# RetailHub

RetailHub es una aplicación web pequeña (MVP) pensada como **producto base para un Quality Engineering Lab**: sobre ella se construirán después proyectos de automation, API testing, CI/CD, performance, métricas e IA. No es un producto comercial; el objetivo es que sea simple, estable, realista y fácil de ejecutar localmente.

## Funcionalidades

- **Autenticación**: login con email/password, JWT, roles `admin` y `operator` con autorización por rol.
- **Productos**: listar, buscar, crear y editar (SKU único, solo `admin`).
- **Inventario**: consultar stock, incrementar/decrementar, impedir stock negativo, historial de movimientos con usuario y tipo.
- **Órdenes**: crear con ítems y cantidades, confirmar (descuenta stock en transacción), cancelar (repone stock si estaba confirmada), estados `PENDING` / `CONFIRMED` / `CANCELLED`.

## Arquitectura

Monorepo con npm workspaces:

```
RetailHub/
├── server/   # Node.js + TypeScript + Express + Prisma + PostgreSQL (API REST, puerto 3001)
├── client/   # React + TypeScript + Vite (puerto 5173)
├── docs/     # Documentación complementaria (convenciones, reglas)
└── docker-compose.yml   # PostgreSQL 16 (puerto 5432)
```

- La lógica de negocio vive en `server/src/services/`; las rutas en `server/src/routes/`; auth y roles en `server/src/middleware/`.
- Validación de entrada con **zod**; errores consistentes `{ "error": { "code", "message" } }`.
- Toda operación de stock u orden crítica corre dentro de una transacción de Prisma.

## Reglas de negocio

1. Solo `admin` crea/edita productos. SKU duplicado → 409.
2. Stock nunca negativo; todo movimiento registra usuario, tipo (`IN`/`OUT`) y cantidad.
3. Orden: cantidades enteras > 0; el total se calcula con precios actuales en el servidor.
4. Confirmar una orden valida stock suficiente para todos los ítems; si falta, 409 y no se descuenta nada (todo o nada).
5. Confirmar descuenta stock y registra movimientos `OUT`; cancelar una orden `CONFIRMED` repone stock con movimientos `IN`.
6. Una orden `CANCELLED` no puede confirmarse; una orden `CONFIRMED` no puede editarse.

## Requisitos

- Node.js 20+
- Docker (para PostgreSQL)

## Cómo ejecutar localmente

```bash
npm install                 # instalar dependencias de server y client
npm run db:up               # levantar PostgreSQL con Docker
cp .env.example .env        # y también copiar a server/.env
cp .env.example server/.env
npm run db:migrate          # aplicar migraciones
npm run db:seed             # usuarios + productos de ejemplo
npm run dev                 # API en :3001 y cliente en :5173
```

Abrir http://localhost:5173.

### Credenciales de prueba

| Rol      | Email                  | Password     |
|----------|------------------------|--------------|
| admin    | admin@retailhub.dev    | admin123     |
| operator | operator@retailhub.dev | operator123  |

## Scripts

- `npm run dev` — levanta server y client en paralelo
- `npm run db:up` / `db:migrate` / `db:seed` — ciclo de base de datos
- `npm run typecheck` — typecheck de ambos paquetes
- `npm run build` — build de ambos paquetes

## Documentación para agentes

Ver [AGENTS.md](AGENTS.md). Convenciones de commits en [docs/commit.md](docs/commit.md).
