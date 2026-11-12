# UberClone — Versión Conductor

Aplicación móvil multiplataforma (iOS y Android) inspirada en la versión de conductor de Uber,
construida con **React Native y Expo**. El conductor se registra con sus datos personales, del
vehículo y documentos; inicia sesión; se pone **Disponible** o **No disponible** y comparte su
ubicación en tiempo real sobre un mapa.

> Proyecto académico. La app se ejecuta con **Expo Go**. Todos los servicios externos usan
> credenciales de **prueba**.

## Contenido

1. [Estado del proyecto](#estado-del-proyecto)
2. [Tecnologías](#tecnologías)
3. [Requisitos previos](#requisitos-previos)
4. [Instalación y ejecución](#instalación-y-ejecución)
5. [Variables de entorno](#variables-de-entorno)
6. [Configuración de Firebase](#configuración-de-firebase)
7. [Configuración de Cloudinary](#configuración-de-cloudinary)
8. [Cómo aprobar a un conductor](#cómo-aprobar-a-un-conductor)
9. [Cómo funciona la app](#cómo-funciona-la-app)
10. [Reglas de validación del registro](#reglas-de-validación-del-registro)
11. [Disponibilidad y ubicación](#disponibilidad-y-ubicación)
12. [Estructura del proyecto](#estructura-del-proyecto)
13. [Datos que guarda la app](#datos-que-guarda-la-app)
14. [Decisiones técnicas](#decisiones-técnicas)
15. [Limitaciones y trabajo pendiente](#limitaciones-y-trabajo-pendiente)
16. [Uso de IA](#uso-de-ia)
17. [Entrega y autor](#entrega-y-autor)

## Estado del proyecto

Funcionalidades principales del taller (sección 1 del enunciado):

| # | Funcionalidad | Estado |
|---|---|---|
| 1 | Registro del conductor (datos personales, vehículo y documentos) con validaciones | Hecho |
| 2 | Cambio de estado Disponible / No disponible y envío de la ubicación en tiempo real | Hecho |
| 3 | Recepción de solicitudes con tiempo límite para aceptar o rechazar | Pendiente |
| 4 | Navegación al punto de recogida y al destino con Google Directions API | Pendiente |
| 5 | Cobro del viaje con Mercado Pago o Stripe en modo de prueba, y pago en efectivo | Pendiente |
| 6 | Cálculo de tarifa, comisión y ganancia neta (`calculateFare`, `src/config/pricing.js`) | Pendiente |
| 7 | Historial de carreras con filtros y resumen de ganancias | Pantallas creadas con mensaje vacío; lógica pendiente |
| 8 | Navegación combinada: Stack, Tabs y Drawer | Hecha en lo que existe (ver más abajo) |

Pantallas del conductor (sección 3):

| Pantalla | Estado |
|---|---|
| Inicio (mapa e interruptor Disponible / No disponible) | Hecha |
| Solicitud entrante | Pendiente |
| Viaje en curso | Pendiente |
| Cobro y resumen del viaje | Pendiente |
| Ganancias | Provisional (mensaje vacío) |
| Historial de carreras | Provisional (mensaje vacío) |
| Perfil y configuración | Solo lectura; edición e idioma editable pendientes |

Además existen: pantalla de carga, inicio de sesión y menú lateral (Drawer).

## Tecnologías

- **Expo SDK 58**, React 19 y React Native 0.88 (JavaScript).
- **React Navigation 7**: `native-stack`, `bottom-tabs` y `drawer`.
- **Firebase** (SDK web `firebase`): Firestore como base de datos.
- **Cloudinary**: almacenamiento de las fotos (perfil, vehículo y documentos).
- `react-native-maps`: mapa del conductor.
- `expo-location`: permiso y lectura de la ubicación.
- `@react-native-async-storage/async-storage`: sesión y preferencias.
- `expo-image-picker` y `@react-native-community/datetimepicker`: fotos y fechas.
- `react-native-gesture-handler`, `react-native-reanimated` y `react-native-worklets`:
  requeridos por el Drawer.

## Requisitos previos

- **Node.js** (versión LTS) y **npm**.
- La app **Expo Go**, compatible con Expo SDK 58, instalada en el celular.
- El celular y el computador en la **misma red Wi-Fi**.
- Un proyecto de **Firebase** con Firestore y una cuenta de **Cloudinary** (gratuita).
  Ver [Configuración de Firebase](#configuración-de-firebase) y
  [Configuración de Cloudinary](#configuración-de-cloudinary).

No se necesita un *development build*: todo funciona en Expo Go.

## Instalación y ejecución

```bash
git clone https://github.com/smotato/UberClone-Taller.git
cd UberClone-Taller
npm install
```

Crea el archivo de variables de entorno a partir del ejemplo y completa los valores
(ver la sección siguiente):

```bash
cp .env.example .env
```

En Windows, `copy .env.example .env`. Después inicia el servidor de desarrollo:

```bash
npx expo start
```

Escanea el código QR con Expo Go. Si cambias el archivo `.env`, reinicia con la caché limpia:

```bash
npx expo start -c
```

Para agregar paquetes nuevos usa siempre `npx expo install <paquete>`, para que Expo elija la
versión compatible con el SDK.

## Variables de entorno

El archivo `.env` **no se sube a Git** (está en `.gitignore`). El repositorio incluye
[`.env.example`](.env.example) con los nombres de las variables y sin valores.

| Variable | Para qué sirve | Dónde se obtiene |
|---|---|---|
| `EXPO_PUBLIC_FIREBASE_API_KEY` | Configuración de Firebase | Consola de Firebase → Configuración del proyecto → Tus apps → app web |
| `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN` | Configuración de Firebase | Igual que la anterior |
| `EXPO_PUBLIC_FIREBASE_PROJECT_ID` | Configuración de Firebase | Igual que la anterior |
| `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET` | Configuración de Firebase (no se usa Firebase Storage) | Igual que la anterior |
| `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Configuración de Firebase | Igual que la anterior |
| `EXPO_PUBLIC_FIREBASE_APP_ID` | Configuración de Firebase | Igual que la anterior |
| `EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID` | Configuración de Firebase (opcional) | Igual que la anterior |
| `EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME` | Nombre de tu cuenta de Cloudinary | Panel de Cloudinary |
| `EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET` | Nombre del *upload preset* sin firma | Ver [Configuración de Cloudinary](#configuración-de-cloudinary) |

Notas de seguridad:

- Las variables con prefijo `EXPO_PUBLIC_` quedan dentro del paquete de la app. Por eso aquí solo
  van valores que no son secretos (la configuración web de Firebase y el nombre de cuenta y
  preset de Cloudinary).
- **Nunca** se guardan en la app la clave secreta (`API Secret`) de Cloudinary, los
  `access_token` de Mercado Pago ni la `secret key` de Stripe. Cuando se implemente el pago irán
  solo en un backend, en un `.env` excluido de Git.
- Solo se usan credenciales de prueba.
- Todavía no se usa ninguna clave de Google Maps: el mapa funciona en Expo Go sin ella. Se
  necesitará al implementar Directions y Distance Matrix.

## Configuración de Firebase

1. Crea un proyecto en la consola de Firebase y registra una **app web** para obtener los valores
   de las variables `EXPO_PUBLIC_FIREBASE_*`.
2. Crea la base de datos **Firestore**. La colección `Driver` se crea sola con el primer registro.
3. Configura las **reglas de seguridad** (pestaña Reglas de Firestore). Un ejemplo mínimo para
   este proyecto, que debes probar en el simulador de reglas antes de publicar:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /Driver/{id} {
      allow read: if true;
      allow create: if request.resource.data.status == 'pending';
      allow update: if request.resource.data.status == resource.data.status;
    }
  }
}
```

Esas reglas permiten registrar solo conductores en estado `pending` y no dejan que la app cambie
el estado de aprobación. La lectura está abierta porque el proyecto no usa Firebase
Authentication; es una simplificación del taller. No uses reglas de "modo de prueba" abiertas
para siempre: vencen a los 30 días y dejan la base sin protección.

La app no usa Firebase Storage ni Firebase Authentication.

## Configuración de Cloudinary

Las fotos se suben a Cloudinary (el enunciado lo recomienda porque Firebase Storage puede exigir
un plan de pago). No hace falta instalar nada adicional:

1. Crea una cuenta gratuita en Cloudinary y copia tu **Cloud name**.
2. En Settings → Upload → Upload presets crea un preset con **Signing mode: Unsigned**.
3. Escribe el cloud name y el nombre del preset en el `.env`.

Las imágenes se guardan con una ruta tipo `drivers/<id del conductor>/<foto>`, y la URL que
devuelve Cloudinary es la que se guarda en Firestore. **No** pongas el API Secret en la app.

## Cómo aprobar a un conductor

Al enviar el registro, la cuenta queda en estado `pending` y el conductor no puede ponerse
Disponible. Como pide el enunciado, la aprobación se simula cambiando el campo en la base de datos:

1. Consola de Firebase → Firestore Database → colección `Driver`.
2. Abre el documento del conductor y edita el campo `status`: cámbialo de `pending` a `approved`
   (en minúsculas y sin espacios).

Con la sesión abierta, la app escucha el documento en tiempo real: el aviso pasa a verde y el
interruptor se habilita sin volver a iniciar sesión. Para volver a probar el estado pendiente,
cambia `status` de nuevo a `pending`. El valor `rejected` muestra el aviso de cuenta rechazada.

## Cómo funciona la app

**Navegación** (sección 1 del enunciado):

- **Stack** raíz (`RootNavigator`): muestra una sola pantalla según el estado de la sesión
  (carga, registro, inicio de sesión o aplicación principal). El flujo del viaje se agregará
  aquí como pantallas hermanas de la principal.
- **Tabs** para el registro: Datos personales, Vehículo y Documentos, con una barra propia que
  muestra el progreso (pasos completos), flechas para avanzar y retroceder, y el botón
  **Enviar registro**.
- **Drawer** para el conductor ya registrado: Inicio, Ganancias, Historial de carreras y
  Perfil y configuración, con la foto, nombre, vehículo y estado de la cuenta.

**Flujo:**

1. **Primera apertura:** pantalla de carga y, si el celular no tiene un conductor registrado, las
   tres pestañas del registro. El botón **Enviar registro** solo se habilita cuando las tres
   están completas y válidas; los errores se muestran debajo de cada campo.
2. **Envío del registro:** un indicador de carga cubre la pantalla mientras se suben las fotos y
   se guarda el conductor con estado `pending`. Luego la app pasa al inicio de sesión.
3. **Inicio de sesión:** correo electrónico y **documento de identidad como contraseña**. Es
   una simplificación didáctica: el enunciado no define el inicio de sesión y la comprobación
   se hace contra Firestore, por lo que **no es autenticación real**. Los datos incorrectos
   muestran una alerta sin indicar cuál falló.
4. **Inicio:** mapa con el auto del conductor, interruptor Disponible / No disponible y menú
   lateral. Un conductor pendiente puede entrar, pero el interruptor está bloqueado.
5. **Cerrar sesión** (desde el menú o desde el perfil) deja la disponibilidad en No disponible y
   vuelve al inicio de sesión sin perder el registro del celular. Al reabrir la app la sesión
   se conserva.

Reglas de la sesión:

- **Un celular, un conductor:** el identificador del conductor registrado se guarda en el
  celular, y el registro no vuelve a mostrarse.
- Si el documento del conductor se borra de Firestore, la app limpia sus datos locales y vuelve
  al registro. Para registrar de nuevo con el mismo documento de identidad hay que borrar antes
  ese documento: el registro rechaza documentos duplicados.
- Si no hay conexión al abrir la app, se muestra un error con el botón **Reintentar** (no se
  trata como "sin registro").
- El idioma de la app (español o inglés) se toma del conductor al iniciar sesión.

## Reglas de validación del registro

Se validan en `src/utils/validators.js`. Los errores aparecen bajo cada campo, nunca en un `Alert`.

| Campo | Regla |
|---|---|
| Foto de perfil | Obligatoria, desde cámara o galería |
| Nombre completo | Máximo 50 caracteres; solo letras y espacios |
| Documento de identidad | Numérico, de 6 a 10 dígitos |
| Número de celular | Numérico, 10 dígitos |
| Fecha de nacimiento | Selector de fecha; el conductor debe ser mayor de 18 años |
| Género e idioma | Listas desplegables (idioma: español o inglés) |
| Correo electrónico | Formato válido con una extensión de dominio real |
| Categoría | Económico, XL o Premium |
| Placa | Formato colombiano `ABC123`; se convierte a mayúsculas antes de validar |
| Marca y modelo | Máximo 30 caracteres cada uno |
| Año | 4 dígitos, no mayor al año actual (desde el 1 de mayo se acepta el año siguiente) |
| Color | Lista desplegable |
| Capacidad de pasajeros | Numérica; la categoría XL exige mínimo 6 |
| Foto del vehículo | Obligatoria (el enunciado pide que se vea la placa; la app no lo verifica automáticamente) |
| Licencia de conducción | Número y foto; vencimiento posterior a hoy |
| SOAT | Foto y vencimiento posterior a hoy |
| Revisión técnico-mecánica | Foto y vencimiento posterior a hoy, solo si el vehículo tiene 5 años o más de modelo |
| Correo de Mercado Pago | Mismo formato de correo |
| Términos | Casilla obligatoria, con la comisión del 20 % visible |

La revisión técnico-mecánica se basa en el **año del modelo**, que es una aproximación: la regla
real cuenta desde la fecha de matrícula, que el formulario no pide. En el registro no se guardan
números de cuenta bancaria ni de tarjeta.

## Disponibilidad y ubicación

La lógica de ubicación está aislada en `src/hooks/useDriverLocation.js`; es el **único archivo que
importa `expo-location`**.

- **Permiso y GPS:** al abrir Inicio se pide el permiso de ubicación una sola vez. El interruptor
  se bloquea si el servicio de ubicación (GPS) del teléfono está apagado o si la cuenta no está
  aprobada. Si el GPS se apaga o la cuenta deja de estar aprobada estando Disponible, la
  disponibilidad se apaga sola.
- **Mientras está Disponible**, la ubicación se escribe en el documento del conductor en Firestore
  **cada 10 segundos** (aunque esté quieto): campos `isAvailable`, `location` (`lat`, `lng`) y
  `locationUpdatedAt`.
- **Se mantiene Disponible al navegar por el menú**: ir a Ganancias, Historial o Perfil no apaga
  la disponibilidad ni el envío de la ubicación, como en las apps reales de conductor. Se
  detienen al apagar el interruptor, cerrar sesión, apagar el GPS o perder la aprobación (la
  función de limpieza de `useEffect` detiene el observador).
- **El auto del conductor** reemplaza el punto azul. Se desliza entre posiciones y gira según
  el rumbo (GPS cuando hay movimiento; si no, calculado entre posiciones, y se conserva el
  último cuando está quieto). Estando **No disponible** el auto también se mueve en pantalla,
  pero no se escribe nada en Firestore.
- **Frecuencia del observador:** alta (cada ~1,5 s o 3 m) con Inicio en pantalla; baja (cada
  ~7 s o 12 m) si el conductor está Disponible y se fue a otra pantalla; apagado en cualquier
  otro caso.
- **Último estado de disponibilidad:** se guarda en AsyncStorage y se restaura al abrir la app
  solo si la cuenta está aprobada y el permiso está concedido.

## Estructura del proyecto

```
App.js                      Providers y punto de entrada
app.json                    Configuración de Expo (incluye el plugin de expo-location)
.env.example                Nombres de las variables de entorno (sin valores)
assets/                     Íconos y las imágenes del auto (car_icon.png, @2x y @3x)
docs/AI_LOG.md              Bitácora de uso de IA
src/
  components/               DriverMarker, DriverDrawerContent, RegistrationTabBar,
                            LoadingOverlay y forms/ (campos de formulario reutilizables)
  config/                   firebaseConfig.js
  context/                  LanguageContext, RegistrationContext, SessionContext
  data/                     Opciones de listas (género, idioma, categoría, color)
  hooks/                    useLanguage, useRegistration, useSession, useStorage,
                            useDriverLocation
  languages/                es.js y en.js (textos de la interfaz)
  navigation/               RootNavigator, RegistrationTabs, DriverDrawer
  screens/                  Registro (3), Login, Carga, Inicio, Ganancias, Historial, Perfil
  services/                 dbServices.js (Firestore) y storageServices.js (Cloudinary)
  theme/                    theme.js (colores, espaciados, tipografía, sombras)
  utils/                    validators.js y buildDriver.js
```

El estado compartido usa **`useContext`**: la sesión del conductor (`SessionContext`), el
formulario de registro (`RegistrationContext`) y el idioma (`LanguageContext`). Los textos están en
español e inglés.

## Datos que guarda la app

**Firestore** (colección `Driver`, un documento por conductor, identificador automático):
datos personales (`fullName`, `idNumber`, `phone`, `birthDate`, `gender`, `email`, `language`,
`profilePhotoURL`), `vehicle` (`category`, `plate`, `brand`, `model`, `year`, `color`,
`capacity`, `vehiclePhotoURL`), `documents` (licencia, SOAT, revisión técnico-mecánica y correo de
Mercado Pago, con las URL de las fotos y las fechas de vencimiento), `status`
(`pending`, `approved` o `rejected`), `isAvailable`, `location`, `locationUpdatedAt` y
`createdAt`.

**AsyncStorage** (solo sesión y preferencias, nunca datos sensibles):

| Clave | Contenido |
|---|---|
| `@uberclone/driverId` | Identificador del conductor registrado en este celular |
| `@uberclone/session` | Indicador de sesión activa |
| `@uberclone/lastAvailability` | Último estado de disponibilidad elegido |

No se guardan números de cuenta bancaria ni de tarjeta, ni en la app ni en AsyncStorage.

## Decisiones técnicas

- **`expo-location` en lugar de `@react-native-community/geolocation`.** Se usa `expo-location`
  (aceptado por la profesora) porque funciona en Expo Go, que es donde se presenta la app. La
  librería de la comunidad contiene código nativo que Expo Go no incluye y exigiría un
  *development build*. Como toda la lógica está aislada en `useDriverLocation`, cambiar de
  librería solo implicaría modificar ese hook.
- **Cloudinary en lugar de Firebase Storage**, por la recomendación del enunciado (Storage puede
  exigir el plan de pago). La subida usa `XMLHttpRequest` porque el `fetch` global de Expo no
  acepta archivos dentro de un `FormData`.
- **Ubicación en primer plano.** El seguimiento solo funciona con la app abierta.
- **El Drawer mantiene la pantalla de Inicio montada**, por eso el seguimiento no depende de
  que Inicio esté enfocada. Se interpreta "salir de la pantalla" del enunciado como salir del
  flujo del conductor (cerrar sesión o desmontar la pantalla), y no como navegar a otra
  opción del menú: así el flujo del viaje, que se abre encima del menú, podrá seguir enviando
  la ubicación.
- **Escrituras a Firestore limitadas** a una cada 10 segundos para cuidar la cuota gratuita,
  mientras la posición en pantalla se actualiza con más frecuencia.
- **Sin Firebase Authentication.** El inicio de sesión compara correo y documento contra el
  documento de Firestore (ver advertencia en [Cómo funciona la app](#cómo-funciona-la-app)).
- **La semana empieza el lunes.** En Ganancias e Historial, "Hoy", "Semana" y "Mes" se calculan
  con la hora del celular (no la del servidor): el día desde las 00:00, la semana desde el lunes
  a las 00:00 y el mes desde el día 1 a las 00:00. Ambas pantallas usan la misma regla y asignan
  cada viaje a un periodo según su `completedAt`.
- **Dependencias del Drawer:** `react-native-reanimated`, `react-native-worklets` y
  `react-native-gesture-handler` son requisitos de `@react-navigation/drawer`; no se usan
  directamente.

## Limitaciones y trabajo pendiente

- Pendientes del enunciado: solicitud entrante con temporizador, viaje en curso con rutas
  (Directions y Distance Matrix), cobro y resumen, ganancias reales, historial con filtros y
  paginación, edición del perfil (incluido el idioma), `calculateFare` y
  `src/config/pricing.js`, la pasarela de pagos (Mercado Pago o Stripe en modo de prueba, con
  backend) y las notificaciones push (Firebase Cloud Messaging, que requiere un *development
  build*).
- La app del pasajero la entregará la profesora; hasta entonces no hay solicitudes de viaje.
- El seguimiento de ubicación no funciona en segundo plano.
- Si la app se cierra de golpe estando Disponible, el campo `isAvailable` puede quedar en
  `true` en la base de datos hasta la siguiente apertura; `locationUpdatedAt` permite detectar
  ubicaciones desactualizadas.
- La verificación de que la foto del vehículo muestre la placa no es automática.
- Sin Firebase Authentication no se puede restringir la lectura de los datos por usuario.

## Uso de IA

Durante el desarrollo de este proyecto se utilizaron herramientas de inteligencia artificial
(principalmente Claude, de Anthropic) como apoyo para planeación, arquitectura, escritura de
código y depuración.

Todo el uso está documentado en la bitácora: [docs/AI_LOG.md](docs/AI_LOG.md).

Cada entrada registra la fecha, el integrante, la herramienta, el prompt completo, un resumen
de la respuesta, qué se usó, modificó o descartó, los archivos y el commit, y cómo se verificó
el resultado.

Los bloques de código asistidos por IA están marcados en el código con un comentario del tipo
`// AI-assisted: see docs/AI_LOG.md #N`, donde `N` es el número de la entrada correspondiente.

El repositorio incluye además `AGENTS.md`, con las instrucciones que siguen las herramientas de
IA al trabajar sobre el proyecto.

## Entrega y autor

- **Repositorio:** https://github.com/smotato/UberClone-Taller
- **Flujo de trabajo:** cada integrante trabaja en su propia rama y sube los cambios a `main`
  mediante Pull Request.
- **Bitácora de IA:** [`docs/AI_LOG.md`](docs/AI_LOG.md) (se entrega también exportada a PDF).
- **Video de demostración (máximo 5 minutos):** *pendiente de agregar el enlace*.

Integrante: Sergio Stiven Motato
