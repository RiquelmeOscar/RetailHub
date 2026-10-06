# Convenciones de commits

Formato: [Conventional Commits](https://www.conventionalcommits.org/es/)

```
<tipo>(<scope>): <descripción corta en español>
```

## Tipos

- `feat`: nueva funcionalidad
- `fix`: corrección de bug
- `chore`: tareas de mantenimiento (deps, configs, scripts)
- `docs`: documentación
- `refactor`: refactor sin cambio funcional
- `test`: tests
- `style`: formato/lint sin cambio funcional

## Scopes

- `server`, `client`, `db`, `docs`, `root`

## Reglas

- Descripción en imperativo, minúscula, sin punto final, máx. ~72 caracteres.
- Un commit = un cambio lógico, pequeño.
- No commitear secretos ni `.env` (usar `.env.example`).
- Si el cambio toca varias áreas, usar el scope del área principal y explicar el resto en el body.

## Ejemplos

```
feat(server): confirmar orden descuenta stock en transacción
fix(client): corregir redirect al expirar el token
chore(root): agregar script db:seed
docs: documentar reglas de negocio en README
```
