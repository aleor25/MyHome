# MyHome - Copilot / Developer Instructions

Este archivo ofrece guías útiles para desarrolladores y para asistentes automáticos (copilots). Está adaptado específicamente para este repositorio `MyHome`.

> Nota rápida: este proyecto usa `app/` para rutas (expo-router) y `components/` en la raíz — si copias material de otros proyectos, ajusta rutas en consecuencia.

## Arquitectura & Rutas

### Expo Router (file-based)
- Rutas y layouts principales se encuentran en `app/`.
- Usa grupos de rutas cuando sea necesario (p. ej. `(tabs)`, `(auth)`).
- Mantén `_layout.tsx` dentro de cada grupo para configurar navegación y opciones de pantalla.

### Estructura de componentes
- `components/ui/` — componentes atómicos y de interfaz (ThemedText, ThemedView, IconSymbol, HapticTab, ExternalLink, etc.).
- `components/layouts/` — componentes que actúan como contenedores o layouts (p. ej. `parallax-scroll-view`).

## Dependencias relevantes (tomadas de `package.json`)
- Expo: ~54.0.18
- React: 19.1.0
- React Native: 0.81.5
- expo-router: ~6.0.13
- react-native-reanimated: ~4.1.1

Si actualizas dependencias, actualiza también esta sección para evitar confusiones.

## Principios clave para contribuciones
- Mantén componentes en `components/` y pantallas en `app/`.
- Evita duplicar lógica entre pantallas; extrae hooks a `hooks/`.
- Usa `@/` como alias de importación si tu `tsconfig.json` lo define.

## Styling
- Este repo usa `StyleSheet` y clases inline en varios componentes; si integras NativeWind, documenta el patrón en `ARCHITECTURE.md`.

## Notas sobre archivos de instrucciones
- Este archivo es una guía para colaboradores y asistentes automáticos. No borres el archivo salvo que lo reemplaces por una guía actualizada.

---

Si quieres, puedo:
- Añadir secciones adicionales (testing, CI, release) si me das detalles,
- O crear versiones reducidas por rol (mantenedor vs contribuidor nuevo).
