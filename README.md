# Jota Delivery

Aplicacion de administracion y reparto construida con React Native, Expo Router y TypeScript. El mismo proyecto entrega la experiencia web y la aplicacion Android; cada plataforma conserva su propio almacenamiento y transporte de notificaciones.

## Stack

- React Native con Expo y Expo Web.
- Expo Router con rutas en `src/app`.
- Zustand para estado global por feature.
- Axios mediante la instancia central de `src/core/api`.
- Jest y React Native Testing Library.
- `twrnc` y configuracion de Tailwind para estilos.

## Arquitectura

El codigo funcional vive principalmente en `src/features` y sigue una organizacion por feature:

- `application`: stores de Zustand y casos de uso.
- `domain`: tipos, contratos y esquemas.
- `presentation`: pantallas y componentes.
- `infrastructure`: integraciones especificas cuando son necesarias.

Las rutas viven en `src/app` y deben delegar la interfaz y la logica a las features. Las peticiones HTTP deben usar la instancia configurada y `process.env.EXPO_PUBLIC_API_URL`; no se deben crear variables de entorno alternativas para la URL del backend.

## Reglas de negocio

- El acceso usa exclusivamente correo y contrasena.
- Si no existe administrador, la navegacion inicial lleva a su creacion; si existe, lleva al inicio de sesion.
- La web persiste la sesion en `localStorage` y Android usa almacenamiento seguro nativo.
- Las notificaciones web usan Web Push y Android usa Expo Notifications. Ambos canales registran tokens o suscripciones en el backend y comparten el contrato de datos del pedido.
- La creacion de un domiciliario envia una invitacion por correo para establecer la contrasena.
- Las operaciones de autenticacion deben capturar errores, conservar un estado seguro y registrar informacion util para diagnostico.

## Criterios de desarrollo

- TypeScript estricto, sin introducir `any`.
- Componentes pequenos y modulares; dividirlos cuando superen aproximadamente 150 lineas o mezclen responsabilidades.
- Mantener contratos de frontend y backend alineados, especialmente en autenticacion, pedidos y notificaciones.
- Agregar `testID` estable a controles que participen en pruebas.
- Validar formularios antes de llamar al backend y mostrar estados de carga y error.
- Al modificar un store de Zustand, conservar estados explicitos de carga, error y mensaje cuando correspondan.
- Las pruebas deben limpiar o restaurar mocks y esperar los cambios asincronos con `waitFor`.

## Comandos

```bash
npm install
npm run start
npm run web
npm run android
npm test
npx tsc --noEmit
npx expo export --platform web
npx expo export --platform android
```

La generacion de APK no forma parte de la validacion habitual del repositorio; se realiza por separado cuando se prepara una entrega Android.

## Configuracion

Defina `EXPO_PUBLIC_API_URL` con la URL del backend. Para notificaciones web tambien se requiere `EXPO_PUBLIC_VAPID_PUBLIC_KEY`. No publique secretos ni archivos locales de entorno.

## Validacion antes de publicar

1. Ejecutar el chequeo de TypeScript.
2. Ejecutar toda la suite de Jest.
3. Exportar web y Android con Expo.
4. Confirmar que no se incluyeron artefactos generados ni cambios ajenos.
