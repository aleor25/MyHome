# Arquitectura del proyecto MyHome

Este documento explica la estructura del proyecto y da reglas prácticas sobre dónde y cuándo crear diferentes tipos de componentes y ficheros. Está escrito en español para que sirva como referencia rápida.

## Visión general

El proyecto utiliza Expo + React Native y `expo-router` con file-based routing. La convención principal es:

- `app/` — Rutas de la aplicación (pantallas y layouts de navegación). Todo lo que está dentro de `app/` se mapea a rutas de la aplicación.
- `components/` — Componentes reutilizables, organizados en subcarpetas según su propósito.
- `components/ui/` — Componentes de interfaz (primitivas o atoms): botones, iconos, texto tematizado, pequeños widgets visuales.
- `components/layouts/` — Componentes de layout/composición que envuelven o estructuran pantallas (headers con parallax, scaffolds, etc.).
- `assets/` — Imágenes, fuentes y recursos estáticos.
- `hooks/` — Hooks reutilizables (ej.: `use-color-scheme.ts`, `use-theme-color.ts`).
- `constants/` — Temas, fuentes, colores y otras constantes globales.
- `scripts/` — Scripts de utilidad (por ejemplo, `reset-project.js`).

## Principios y reglas rápidas

1. File-based routing y `app/`:
   - Crear pantallas (páginas) en `app/`. Por ejemplo, `app/(tabs)/index.tsx` es la pantalla principal.
   - Layouts de navegación o secciones (ej.: `_layout.tsx`) deben permanecer dentro de `app/` en la estructura que `expo-router` requiere.
   - No pongas lógica de negocio pesada dentro de los archivos de `app/` — en su lugar, extrae a hooks o servicios.

2. Componentes UI (`components/ui/`):
   - Coloca aquí componentes pequeños y atómicos: `Button`, `Icon`, `ThemedText`, `ThemedView`, `HapticTab`, `ExternalLink`, etc.
   - Los componentes deben ser *presentacionales* (reciben props y devuelven UI). Evita lógica de navegación o suscripciones directas.
   - Reutilizables en varias pantallas: si el componente solo se usa en una pantalla, puedes mantenerlo cerca a la pantalla; si se reutiliza, muévelo a `components/ui/`.

3. Layouts / Containers (`components/layouts/`):
   - Usa esta carpeta para componentes que organizan grandes secciones de la UI o proporcionan comportamiento (por ejemplo `ParallaxScrollView`, `ScreenWrapper`, `ScrollWithHeader`).
   - Son responsables de la estructura visual de la pantalla y pueden contener varios componentes UI.
   - Pueden incluir cierta lógica de UI (animaciones, scroll handling) pero no lógica de negocio.

4. Componentes por dominio o feature (opcional):
   - Si el proyecto crece, considera crear carpetas por feature: `features/todos/` con `components/`, `hooks/`, `screens/` dentro.
   - Esto mejora el aislamiento y el mantenimiento en proyectos grandes.

5. Hooks, utilidades y constantes:
   - `hooks/` para hooks personalizados.
   - `utils/` o `lib/` para funciones utilitarias puras.
   - `constants/` para temas y settings.

6. Exports y re-exports:
   - Para facilitar migraciones, puedes usar archivos `index.ts` o re-exports (por ejemplo `components/index.ts`) pero evita crear dependencias circulares.
   - Cuando mueves componentes, considera mantener un re-export temporal en la ruta antigua para no romper imports (migrar gradualmente).

## ¿Dónde crear X? — Guía rápida

- Nuevo botón compartido por la app: `components/ui/Button.tsx`.
- Icono o símbolo (adaptaciones por plataforma): `components/ui/icon-symbol.tsx`.
- Componente con animaciones complejas que se reutiliza: `components/layouts/MyAnimatedLayout.tsx`.
- Pantalla nueva / ruta: `app/(tabs)/my-new-screen.tsx` o `app/my-new-screen.tsx` según la estructura de navegación.
- Hook que encapsula fetch o lógica de estado: `hooks/useSomething.ts`.
- Constantes de diseño: `constants/theme.ts`.

## Ejemplos concretos en este proyecto

- `components/ui/themed-view.tsx` — componente atom para vistas con color de tema.
- `components/ui/themed-text.tsx` — textos tematizados.
- `components/layouts/parallax-scroll-view.tsx` — componente que organiza la pantalla con cabecera parallax.
- `app/(tabs)/_layout.tsx` — layout que monta las tabs.

## Buenas prácticas

- Mantén los componentes pequeños y especializados.
- Extrae lógica repetida a hooks.
- Usa Props bien tipadas en TypeScript.
- Evita acoplamientos (p. ej., que un componente UI importe rutas o `expo-router`).
- Usa re-exports con moderación durante migraciones.

## Flujo recomendado al agregar un componente

1. Decide si es un UI primitive (ui/) o layout/ container (layouts/), o específico de una pantalla.
2. Crea el archivo en la carpeta correcta.
3. Escribe tests mínimos si el proyecto tiene test runner (opcional).
4. Actualiza las importaciones donde sea necesario.
5. Si cambias la ubicación de un componente ya usado, deja un re-export en la ruta antigua por una iteración y haz un commit con un mensaje claro: "chore: mover X a components/ui y re-export".

---