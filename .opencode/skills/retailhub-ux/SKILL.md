---
name: retailhub-ux
description: Mejora la UX/UI de RetailHub (colores, botones, estilos, layout, formularios, accesibilidad, estados de carga y vacíos). Úsala cuando se pida mejorar cómo se ve o se siente la interfaz, ajustar estilos, colores, botones, responsive o accesibilidad del cliente React.
---

# RetailHub UX/UI

## Cuándo usarla

- Pedidos de "mejorar UI/UX", "colores", "botones", "estilos", "se ve mal", "responsive", "accesibilidad", "estados de carga o vacío".
- Iteraciones de `retailhub-iterate` con un ítem de categoría **UX** en `docs/backlog.md`.

## Estado actual del cliente

- Todo el estilo vive en `client/src/styles.css` (CSS plano, sin framework ni tokens).
- Paleta actual: fondo `#f6f7f9`, nav `#1f2937`, links nav `#d1d5db`, primario `#2563eb`, deshabilitado `#9ca3af`, error `#b91c1c`, borde `#e5e7eb`.
- Clases existentes: `.layout main`, `.nav` (+ `.spacer`), `.card`, `.error`, estilos directos de `table`, `input`, `select`, `button`.
- Páginas: `client/src/pages/{Login,Products,Inventory,Orders,NewOrder,OrderDetail}.tsx`; layout en `client/src/components/Layout.tsx`.
- No hay estados de carga, estados vacíos, labels accesibles ni foco personalizado.

## Reglas

- Mantener **CSS plano** en `client/src/styles.css`. No instalar Tailwind, CSS-in-JS ni librerías de componentes sin decisión explícita del usuario.
- Un cambio de UX por iteración, pequeño y revisable. No tocar lógica de negocio ni contratos de API.
- No romper flujos existentes: login, CRUD de productos (solo admin), inventario, órdenes.
- Textos de interfaz en español, consistentes con los existentes ("Productos", "Inventario", "Órdenes", "Salir").

## Playbook (elegí una dimensión por iteración)

1. **Tokens**: definir variables en `:root` (colores, espaciado, radios, sombras) y reemplazar valores literales.
2. **Estados de controles**: `:hover`, `:focus-visible` (visible y con contraste), `:disabled`, `cursor: pointer`.
3. **Formularios**: `<label htmlFor>`, `aria-invalid` cuando corresponda, `role="alert"` en mensajes de error.
4. **Feedback**: estados de carga (botón `disabled` + texto tipo "Guardando…") y vacíos ("No hay productos todavía") en cada página.
5. **Jerarquía y layout**: títulos, separación de secciones, espaciado consistente, ancho máximo legible.
6. **Responsive**: nav que envuelve, tablas con `overflow-x: auto` en pantallas chicas, card a ancho completo en mobile.
7. **Contraste**: apuntar a WCAG AA (4.5:1 en texto normal). Verificar el par texto/fondo de cada componente tocado.

## Proceso

1. Leer `client/src/styles.css` y la(s) página(s) afectadas.
2. Implementar el cambio mínimo que cumpla el criterio de aceptación del ítem del backlog.
3. Verificar:
   - `npm run typecheck -w client`
   - `npm run build -w client`
   - Revisión visual con la app corriendo (`npm run dev`): usar el browser de Orca:
     - `orca tab create --url http://localhost:5173 --json`
     - `orca snapshot` para inspeccionar, `orca screenshot --format png`
     - Login con credenciales seed (`admin@retailhub.dev` / `admin123`) y recorrer la página tocada.
4. Reportar qué cambió y con qué evidencia (resultado de build + captura o descripción de lo observado).

## Criterios de aceptación

- `typecheck` y `build` en verde.
- El cambio se percibe en la página indicada y no rompe las demás.
- Sin dependencias nuevas, sin cambios de lógica ni de API.

## Commit

`style(client): ...` o `feat(client): ...` según `docs/commit.md`.
