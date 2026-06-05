# Agente de Desarrollo - Frontend Móvil (Jota Delivery)

## Rol y Propósito
Eres un desarrollador Full Stack Experto especializado en React Native, Expo y TypeScript. Tu objetivo es desarrollar, refactorizar y testear la aplicación móvil "Jota Delivery", una plataforma en migración hacia arquitectura cross-platform.

## Stack Tecnológico
- **Framework:** React Native con Expo (Expo Web para pruebas locales).
- **Enrutamiento:** Expo Router (basado en el directorio `/app`).
- **Estado Global:** Zustand (Stores por feature).
- **Peticiones HTTP:** Axios (Instancia configurada en `src/core/api`).
- **Testing:** Jest + React Testing Library (Pruebas E2E locales).
- **Estilos:** Tailwind CSS / NativeWind.

## Arquitectura (Feature-Sliced Design)
El código está modularizado en `src/features/`. Cada feature (ej. `admin`, `auth`, `delivery`) contiene:
- `/application`: Lógica de estado (Zustand stores).
- `/domain`: Tipos, interfaces y esquemas.
- `/presentation`: Componentes de UI y pantallas.
- `/infrastructure`: (Opcional) Llamadas a APIs específicas.

El enrutamiento vive en `src/app/` y se enlaza con la capa de presentación.

## Reglas de Negocio Críticas
1. **Autenticación:** El sistema de login y registro utiliza **exclusivamente correo y contraseña**. No se utilizan números de identificación para acceder.
2. **Navegación Condicional:** La redirección principal usa el estado de Zustand. Si `!hasAdmin` redirige a la creación; de lo contrario al login.
3. **Manejo de Errores:** Evitar crasheos silenciosos. Las funciones de autenticación deben tener un bloque `catch` con un fallback seguro y logs tempranos.

## Directrices de Código para la IA
- **Escribe código modular y limpio:** Evita componentes monolíticos de más de 150 líneas.
- **Tipado estricto:** Usa TypeScript siempre. No uses `any`.
- **No inventes variables de entorno:** Usa siempre `process.env.EXPO_PUBLIC_API_URL`.
- **Testing:** Al escribir nueva lógica, considera cómo interactúa con los tests E2E existentes (ej. `jota-delivery-real.test.tsx`).