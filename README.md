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

### Ambientes locales

- `.env`: ambiente local de desarrollo.
- `.env.prod`: referencia local de produccion.
- Las variables locales no deben subirse al repositorio.
- Para Android fisico en desarrollo, no usar `localhost`; usar la IP local de la maquina.

Ejemplo de desarrollo local:

```env
EXPO_PUBLIC_API_URL=http://192.168.1.20:3000/api/v1
```

Ejemplo de produccion:

```env
EXPO_PUBLIC_API_URL=https://domicilios-jota-backend.vercel.app/api/v1
```

### Variables en EAS

Para builds y updates de produccion, la variable debe existir en el ambiente `production` de EAS:

```bash
npx eas-cli@latest env:create --name EXPO_PUBLIC_API_URL --value "https://domicilios-jota-backend.vercel.app/api/v1" --environment production --visibility plaintext
```

El perfil de build debe usar `"environment": "production"` para que EAS tome esas variables durante la compilacion.

## Validacion antes de publicar

1. Ejecutar el chequeo de TypeScript.
2. Ejecutar toda la suite de Jest.
3. Exportar web y Android con Expo.
4. Confirmar que no se incluyeron artefactos generados ni cambios ajenos.

```bash
npm test
npx tsc --noEmit
```

## APK Android con EAS Build

La APK instalable de Android se genera con el perfil `apk-production`:

```bash
npx eas-cli@latest build --platform android --profile apk-production
```

Ese perfil debe cumplir estas reglas en `eas.json`:

- `distribution`: `internal`
- `channel`: `production`
- `environment`: `production`
- `android.buildType`: `apk`

La APK queda asociada al canal `production`. Por eso, las actualizaciones OTA deben publicarse en ese mismo canal.

Si EAS pregunta por credenciales Android o keystore, permitir que Expo las genere y administre.

## Actualizaciones OTA con EAS Update

Despues de instalar la APK en los dispositivos, se pueden subir actualizaciones sin generar otra APK cuando los cambios sean de JavaScript, pantallas, textos, estilos o logica de negocio.

Comando para publicar una actualizacion OTA en produccion:

```bash
npx eas-cli@latest update --channel production --environment production --message "Descripcion del cambio"
```

Ejemplo:

```bash
npx eas-cli@latest update --channel production --environment production --message "Fix historial de pedidos"
```

### Cambios que SI pueden ir por update OTA

- Textos.
- Estilos.
- Pantallas React Native.
- Logica JavaScript/TypeScript.
- Correcciones de navegacion.
- Ajustes en formularios, filtros o validaciones.

### Cambios que requieren nueva APK

- Nuevas librerias nativas.
- Cambios en plugins de Expo.
- Cambios en permisos Android.
- Cambios en `android.package`.
- Cambios en icono, splash nativo o configuracion nativa.
- Cambios de SDK de Expo o runtime nativo.

Si hay duda, generar una nueva APK.
