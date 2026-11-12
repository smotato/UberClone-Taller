# UberClone — Versión Conductor

Aplicación móvil multiplataforma (iOS y Android) inspirada en la versión de conductor de Uber,
construida con **React Native y Expo**. El conductor se registra con sus datos personales, del
vehículo y documentos; inicia sesión; se pone **Disponible** o **No disponible** y comparte su
ubicación en tiempo real sobre un mapa; recibe solicitudes de viaje, las atiende con una ruta
sobre el mapa, cobra en efectivo y consulta sus ganancias, su saldo y su historial de carreras.

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
12. [Flujo del viaje](#flujo-del-viaje)
13. [Ganancias, historial y perfil](#ganancias-historial-y-perfil)
14. [Herramientas de desarrollo](#herramientas-de-desarrollo)
15. [Estructura del proyecto](#estructura-del-proyecto)
16. [Datos que guarda la app](#datos-que-guarda-la-app)
17. [Decisiones técnicas](#decisiones-técnicas)
18. [Limitaciones y trabajo pendiente](#limitaciones-y-trabajo-pendiente)
19. [Uso de IA](#uso-de-ia)
20. [Entrega y autor](#entrega-y-autor)

## Estado del proyecto

Funcionalidades principales del taller (sección 1 del enunciado):

| # | Funcionalidad | Estado |
|---|---|---|
| 1 | Registro del conductor (datos personales, vehículo y documentos) con validaciones | Hecho |
| 2 | Cambio de estado Disponible / No disponible y envío de la ubicación en tiempo real | Hecho |
| 3 | Recepción de solicitudes con tiempo límite para aceptar o rechazar | Hecho (con solicitudes simuladas hasta que exista la app del pasajero) |
| 4 | Navegación al punto de recogida y al destino con Google Directions API (se usa OpenRouteService en su lugar) | Hecho |
| 5 | Cobro del viaje con Mercado Pago o Stripe en modo de prueba, y pago en efectivo | Efectivo hecho; la pasarela de pagos está pendiente |
| 6 | Cálculo de tarifa, comisión y ganancia neta (`calculateFare`, `src/config/pricing.js`) | Hecho |
| 7 | Historial de carreras con filtros y resumen de ganancias | Hecho |
| 8 | Navegación combinada: Stack, Tabs y Drawer | Hecha |

Pantallas del conductor (sección 3):

| Pantalla | Estado |
|---|---|
| Inicio (mapa e interruptor Disponible / No disponible) | Hecha |
| Solicitud entrante | Hecha |
| Viaje en curso | Hecha |
| Cobro y resumen del viaje | Hecha para efectivo; con pasarela queda en Pendiente |
| Ganancias | Hecha |
| Historial de carreras (con detalle y ruta en el mapa) | Hecha |
| Perfil y configuración | Hecha: celular, correo, documentos e idioma editables; vehículo en solo lectura |

Además existen: pantalla de carga, inicio de sesión y menú lateral (Drawer).

Pendiente del enunciado: la pasarela de pagos (Mercado Pago o Stripe) y las notificaciones push
(ver [Limitaciones y trabajo pendiente](#limitaciones-y-trabajo-pendiente)).

## Tecnologías

- **Expo SDK 58**, React 19 y React Native 0.88 (JavaScript).
- **React Navigation 7**: `native-stack`, `bottom-tabs` y `drawer`.
- **Firebase** (SDK web `firebase`): Firestore como base de datos, con escucha en tiempo real,
  transacciones y consultas de agregación.
- **Cloudinary**: almacenamiento de las fotos (perfil, vehículo y documentos).
- **OpenRouteService**: distancia, duración y ruta de los viajes (datos de OpenStreetMap).
- `react-native-maps`: mapa del conductor y de los viajes.
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
- Opcional: una llave gratuita de **OpenRouteService** para dibujar las rutas de los viajes
  (ver [Variables de entorno](#variables-de-entorno)).

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
| `EXPO_PUBLIC_ORS_API_KEY` | Llave de OpenRouteService para las rutas del viaje; opcional | Panel de [OpenRouteService](https://account.heigit.org/signup) → *Request a token* (plan gratuito Standard) |

Notas de seguridad:

- Las variables con prefijo `EXPO_PUBLIC_` quedan dentro del paquete de la app. Por eso aquí solo
  van valores que no son secretos (la configuración web de Firebase y el nombre de cuenta y
  preset de Cloudinary).
- **Nunca** se guardan en la app la clave secreta (`API Secret`) de Cloudinary, los
  `access_token` de Mercado Pago ni la `secret key` de Stripe. Cuando se implemente el pago irán
  solo en un backend, en un `.env` excluido de Git.
- Solo se usan credenciales de prueba.
- El mapa funciona en Expo Go sin ninguna clave. `EXPO_PUBLIC_ORS_API_KEY` sirve únicamente
  para calcular distancia, duración y ruta del viaje con OpenRouteService (ver
  [Decisiones técnicas](#decisiones-técnicas)). Sin la llave, o si el servicio falla o se agota
  la cuota, la app sigue funcionando y dibuja una línea recta de respaldo con un aviso.
- **Limitación conocida:** los términos de HeiGIT (OpenRouteService) indican que cada llave
  pertenece a una persona y que no debe usarse del lado del cliente de una aplicación, porque
  se puede ver al inspeccionar las solicitudes. Aquí la llave viaja dentro de la app
  (`EXPO_PUBLIC_`) porque es un proyecto académico sin backend; por eso cada persona que
  ejecute la app debe usar su propia llave personal, que nunca se sube al repositorio. Una
  versión de producción debería pedir las rutas desde un servidor propio.

## Configuración de Firebase

1. Crea un proyecto en la consola de Firebase y registra una **app web** para obtener los valores
   de las variables `EXPO_PUBLIC_FIREBASE_*`.
2. Crea la base de datos **Firestore**. La colección `Driver` se crea sola con el primer registro
   y la colección `trips`, con el primer viaje.
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
    match /trips/{id} {
      allow read: if true;
      allow create: if true;
      allow update: if request.resource.data.driverId == resource.data.driverId;
      allow delete: if resource.data.isDemo == true;
    }
  }
}
```

Las reglas de `Driver` permiten registrar solo conductores en estado `pending` y no dejan que la
app cambie el estado de aprobación. Las de `trips` permiten crear solicitudes y viajes (la app del
pasajero y las herramientas de desarrollo), cambiar el estado de un viaje sin cambiarle el
conductor, y borrar únicamente los viajes de ejemplo. La lectura está abierta porque el proyecto no
usa Firebase Authentication; es una simplificación del taller. No uses reglas de "modo de prueba"
abiertas para siempre: vencen a los 30 días y dejan la base sin protección.

**Índices.** Las consultas de Ganancias y del Historial combinan filtros por conductor, método de
pago y fecha de cierre, y pueden necesitar índices compuestos de Firestore (por ejemplo,
`driverId` + `completedAt` descendente, y `driverId` + `paymentMethod` + `completedAt`
descendente). Si falta alguno, con la app en modo desarrollo la consola de Metro muestra el error
de Firestore con el enlace para crearlo con un clic.

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
  (carga, registro, inicio de sesión o aplicación principal). Con la sesión iniciada, las
  pantallas del flujo del viaje (solicitud entrante, viaje en curso y resumen) y el detalle de
  un viaje del historial son pantallas hermanas de la principal.
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
   muestran una alerta sin indicar cuál falló. Si el conductor cambió su correo desde el perfil,
   el inicio de sesión se hace con el correo nuevo.
4. **Inicio:** mapa con el auto del conductor, interruptor Disponible / No disponible y menú
   lateral. Un conductor pendiente puede entrar, pero el interruptor está bloqueado.
5. **Viajes:** estando Disponible llegan las solicitudes (ver [Flujo del viaje](#flujo-del-viaje)).
6. **Cerrar sesión** (desde el menú o desde el perfil) deja la disponibilidad en No disponible y
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
- El idioma de la app (español o inglés) se toma del conductor al iniciar sesión; si el conductor
  lo cambia, se conserva en el celular y en su cuenta.

## Reglas de validación del registro

Se validan en `src/utils/validators.js`. Los errores aparecen bajo cada campo, nunca en un `Alert`.
El perfil reutiliza estas mismas validaciones para los campos que permite editar.

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
- **Durante un viaje** el envío de la ubicación a Firestore sigue siendo el de Inicio (que
  permanece montado bajo las pantallas del viaje); el mapa del viaje abre su propio observador
  para mover el auto con fluidez.
- **El auto del conductor** reemplaza el punto azul. Se desliza entre posiciones y gira según
  el rumbo (GPS cuando hay movimiento; si no, calculado entre posiciones, y se conserva el
  último cuando está quieto). Estando **No disponible** el auto también se mueve en pantalla,
  pero no se escribe nada en Firestore.
- **Frecuencia del observador:** alta (cada ~1,5 s o 3 m) con Inicio en pantalla; baja (cada
  ~7 s o 12 m) si el conductor está Disponible y se fue a otra pantalla; apagado en cualquier
  otro caso.
- **Último estado de disponibilidad:** se guarda en AsyncStorage y se restaura al abrir la app
  solo si la cuenta está aprobada y el permiso está concedido.

## Flujo del viaje

El flujo sigue los estados del enunciado, que se guardan en el campo `status` del viaje y deciden
qué pantalla se muestra: `requested` → `accepted` → `driver_arriving` → `in_progress` →
`completed` → `paid`, más `rejected` y `cancelled`. Las reglas de transición están en
`src/utils/tripStateMachine.js` y el estado del viaje activo vive en `TripContext`.

1. **Solicitud entrante.** Solo se reciben solicitudes si la cuenta está aprobada, el conductor
   está Disponible y no tiene otro viaje en curso. La pantalla se abre sola, esté donde esté el
   conductor, y muestra recogida, destino, distancia, duración, categoría, método de pago, tarifa
   estimada y ganancia neta estimada, con un temporizador de **15 segundos**. Si llega a cero, la
   solicitud se rechaza sola (`rejected` con motivo `timeout`). Si la solicitud ya no está
   disponible (la canceló el pasajero), la app avisa.
2. **Viaje en curso.** Al aceptar, el mapa dibuja la ruta del conductor a la recogida, con tiempo y
   distancia. **Pasajero a bordo** cambia al tramo hacia el destino y **Finalizar viaje** cierra el
   viaje. El conductor puede cancelar solo antes de que el pasajero esté a bordo.
3. **Cobro y resumen.** Muestra tarifa final, comisión (con el porcentaje de ese viaje), propina,
   ganancia neta y el estado del pago (Aprobado, Pendiente, Rechazado o Efectivo).
   - **Efectivo:** el conductor toca **Cobro recibido en efectivo** y el viaje pasa a `paid`; la
     comisión se descuenta del saldo.
   - **Mercado Pago o Stripe:** todavía no hay pasarela, así que el viaje queda `completed` con el
     pago **Pendiente** y se ve en el historial con ese estado.

Reglas importantes:

- **Cada cambio de estado es una transacción de Firestore** que comprueba que el viaje siga en el
  estado esperado y que sea del conductor, para no pisar cambios del pasajero (por ejemplo, una
  cancelación). Cada escritura tiene un tiempo máximo de 10 segundos: sin red, Firestore no falla
  sino que espera, así que se corta la espera y se avisa con una alerta.
- **Los montos se calculan una sola vez, al finalizar**, con `calculateFare` (la misma función
  de la estimación) y se guardan como **números enteros** junto con el `commissionRate`
  aplicado. La distancia y la duración finales son las del tramo recogida → destino, no el tiempo
  real transcurrido.
- **Rutas.** Se piden una sola vez por tramo y viaje (nunca en cada movimiento) a OpenRouteService.
  Si falta la llave, se agota la cuota o falla la red, el mapa dibuja una línea recta punteada con
  un aviso y el viaje continúa. Al finalizar se guarda la ruta del tramo cobrado de forma
  compacta (polilínea codificada de hasta 100 puntos). Cuando se dibuja una ruta se muestra
  "© OpenStreetMap contributors".
- **Retomar el viaje.** Si se cierra la app con un viaje en curso, al abrirla e iniciar sesión se
  vuelve a la pantalla que corresponde. Mientras hay un viaje activo no llegan solicitudes nuevas.
- **Botón atrás bloqueado.** Ni el gesto ni el botón atrás de Android sacan al conductor de la
  solicitud, del viaje o del resumen.

## Ganancias, historial y perfil

**Ganancias.** Muestra el saldo y las tarjetas de **Hoy**, **Esta semana** y **Este mes**, cada
una con número de viajes, total facturado, comisiones, propinas, ganancia neta y promedio por
viaje.

- Los totales de dinero cuentan **solo los viajes pagados (`paid`)**. Un viaje terminado con pago
  pendiente o rechazado aparece en el historial con su estado, pero no suma.
- Los totales se calculan con `useMemo` sobre una consulta propia, acotada por fecha, de los
  viajes pagados del periodo más antiguo (no sobre el historial paginado), así nunca salen
  incompletos.
- El **saldo** es la suma de las ganancias de los viajes pagados con pasarela menos las
  comisiones de los viajes en efectivo, sobre **todos** los viajes pagados. Se calcula con
  consultas de agregación de Firestore (tres sumas y un conteo de control), por lo que **requiere
  conexión** y no se actualiza solo: se recarga al entrar a Ganancias, al llegar un viaje pagado
  y con el gesto de actualizar. Si una consulta falla se muestra un error con **Reintentar**,
  nunca un total parcial; si el conteo no cuadra (por ejemplo, un método de pago desconocido) se
  muestra un aviso de descuadre.

**Historial de carreras.** Lista paginada de a 20 viajes (`FlatList`), del más reciente al más
antiguo, con los filtros **Hoy**, **Semana**, **Mes** y **Rango de fechas**, y un filtro por
método de pago. Cada elemento muestra fecha y hora, origen → destino, categoría, tarifa, ganancia
neta y estado del pago; al tocarlo se abre el detalle con la ruta dibujada, distancia, duración,
comisión, propina y calificación. Un viaje sin ruta guardada se abre igual, solo con los datos.
Los periodos usan la hora del celular y la semana empieza el lunes (ver
[Decisiones técnicas](#decisiones-técnicas)).

**Perfil y configuración.**

- **Datos personales:** se pueden editar el **celular** y el **correo** (el correo es el de inicio
  de sesión). La foto, el nombre, el documento de identidad, la fecha de nacimiento y el género
  están bloqueados.
- **Vehículo:** solo lectura. Un vehículo aprobado no se edita; cambiar de vehículo implicaría
  registrarlo y aprobarlo de nuevo, y eso queda fuera de esta versión.
- **Documentos:** licencia, SOAT y revisión técnico-mecánica (si aplica) se **renuevan** con una
  foto nueva y un vencimiento nuevo posterior a hoy; las dos cosas van juntas. El número de
  licencia está bloqueado y el correo de Mercado Pago es editable. Cambiar documentos **no pide
  reaprobación**: no se toca el estado de la cuenta.
- **Idioma:** se cambia al instante, sin botón Guardar, y se conserva en el celular y en la cuenta.
- Cada tarjeta se edita por separado, solo una a la vez; **Guardar** se habilita cuando hay
  cambios válidos y solo se escriben los campos que cambiaron.

## Herramientas de desarrollo

Como todavía no hay app del pasajero, hay herramientas que **solo aparecen con la app en modo
desarrollo** (`npx expo start`, que es como corre en Expo Go; en un *build* de producción no
existen):

- En **Ganancias**: *Cargar viajes de ejemplo* (unos 15 viajes marcados con `isDemo`, con rutas,
  distintos métodos y estados de pago), *Borrar viajes de ejemplo* (borra solo los marcados) y
  *Simular solicitud* en efectivo o con pasarela, que crea una solicitud para el conductor. Para
  recibirla hay que estar aprobado y Disponible.
- En el **resumen de un viaje con pasarela**: *Simular pago aprobado* y *Simular pago rechazado*,
  que hacen el trabajo que haría el backend de la pasarela.

Cuando exista la app del pasajero, las solicitudes simuladas dejan de ser necesarias; sus botones
se pueden retirar sin afectar el resto del flujo.

## Estructura del proyecto

```
App.js                      Providers y punto de entrada
app.json                    Configuración de Expo (incluye el plugin de expo-location)
.env.example                Nombres de las variables de entorno (sin valores)
assets/                     Íconos y las imágenes del auto (car_icon.png, @2x y @3x)
docs/AI_LOG.md              Bitácora de uso de IA
src/
  components/               DriverMarker, DriverDrawerContent, RegistrationTabBar, LoadingOverlay
                            forms/     campos de formulario reutilizables
                            profile/   secciones del perfil (datos, vehículo, documentos, idioma)
                            earnings/  tarjetas de saldo y de periodos
                            history/   filtros y elementos del historial
                            trip/      mapa del viaje y atribución de la ruta
  config/                   firebaseConfig, pricing (tarifas y comisión) y tripFlow (tiempos del viaje)
  context/                  LanguageContext, RegistrationContext, SessionContext, TripContext
  data/                     Opciones de listas (género, idioma, categoría, color, método de pago)
  hooks/                    useLanguage, useRegistration, useSession, useStorage, useDriverLocation,
                            useProfileEdit, useEarnings, useTripHistory, useTripRequests, useTrip,
                            useCountdown
  languages/                es.js y en.js (textos de la interfaz)
  navigation/               RootNavigator, RegistrationTabs, DriverDrawer, navigationRef
  screens/                  Registro (3), Login, Carga, Inicio, Ganancias, Historial, Detalle del
                            viaje, Perfil, Solicitud entrante, Viaje en curso y Resumen del viaje
  services/                 driverServices (conductor), tripServices (viajes), routesServices
                            (rutas) y storageServices (Cloudinary)
  theme/                    theme.js (colores, espaciados, tipografía, sombras)
  utils/                    validators, buildDriver, calculateFare, tripStateMachine, dateRanges,
                            earningsSummary, polyline, profileMappers, formatCurrency y demoTrips
```

El estado compartido usa **`useContext`**: la sesión del conductor (`SessionContext`), el
formulario de registro (`RegistrationContext`), el idioma (`LanguageContext`) y el viaje activo
(`TripContext`). Los textos están en español e inglés.

## Datos que guarda la app

**Firestore, colección `Driver`** (un documento por conductor, identificador automático):
datos personales (`fullName`, `idNumber`, `phone`, `birthDate`, `gender`, `email`, `language`,
`profilePhotoURL`), `vehicle` (`category`, `plate`, `brand`, `model`, `year`, `color`,
`capacity`, `vehiclePhotoURL`), `documents` (licencia, SOAT, revisión técnico-mecánica y correo de
Mercado Pago, con las URL de las fotos y las fechas de vencimiento), `status`
(`pending`, `approved` o `rejected`), `isAvailable`, `location`, `locationUpdatedAt`,
`createdAt` y, tras editar el perfil, `updatedAt`.

**Firestore, colección `trips`** (un documento por viaje): `driverId`, `passengerId`, `origin` y
`destination` (`lat`, `lng`, `address`), `category`, `distanceKm`, `durationMin`, `paymentMethod`
(`mercadopago`, `stripe` o `cash`), `paymentStatus` (`approved`, `pending`, `rejected` o `cash`),
`paymentId`, `status` (los siete estados del viaje, más `rejected`), `fare`, `commission`, `tip`,
`driverEarnings` y `commissionRate` (pesos enteros), `rating`, `route` (polilínea codificada de
hasta 100 puntos, o `null`), las marcas de tiempo de cada paso (`createdAt`, `acceptedAt`,
`arrivingAt`, `startedAt`, `completedAt`, `paidAt`, `rejectedAt`, `cancelledAt`), `updatedAt` e
`isDemo` en los viajes de ejemplo. Todas las marcas de tiempo son números (`Date.now()`) con la hora
del celular, no la del servidor.

**AsyncStorage** (solo sesión y preferencias, nunca datos sensibles):

| Clave | Contenido |
|---|---|
| `@uberclone/driverId` | Identificador del conductor registrado en este celular |
| `@uberclone/session` | Indicador de sesión activa |
| `@uberclone/lastAvailability` | Último estado de disponibilidad elegido |
| `@uberclone/language` | Idioma elegido (`es` o `en`) |

No se guardan números de cuenta bancaria ni de tarjeta, ni en la app ni en AsyncStorage.

## Decisiones técnicas

- **`expo-location` en lugar de `@react-native-community/geolocation`.** Se usa `expo-location`
  (aceptado por la profesora) porque funciona en Expo Go, que es donde se presenta la app. La
  librería de la comunidad contiene código nativo que Expo Go no incluye y exigiría un
  *development build*. Como toda la lógica está aislada en `useDriverLocation`, cambiar de
  librería solo implicaría modificar ese hook.
- **Cloudinary en lugar de Firebase Storage**, por la recomendación del enunciado (Storage puede
  exigir el plan de pago). La subida usa `XMLHttpRequest` porque el `fetch` global de Expo no
  acepta archivos dentro de un `FormData`. Al renovar un documento la foto nueva se sube con un
  nombre único (un preset sin firma no garantiza poder sobrescribir), por lo que las imágenes
  anteriores quedan sin uso en Cloudinary y se pueden borrar a mano desde su *Media Library*.
- **Ubicación en primer plano.** El seguimiento solo funciona con la app abierta.
- **El Drawer mantiene la pantalla de Inicio montada**, por eso el seguimiento no depende de
  que Inicio esté enfocada. Se interpreta "salir de la pantalla" del enunciado como salir del
  flujo del conductor (cerrar sesión o desmontar la pantalla), y no como navegar a otra
  opción del menú: así el flujo del viaje, que se abre encima del menú, sigue enviando la
  ubicación.
- **Escrituras a Firestore limitadas** a una cada 10 segundos para cuidar la cuota gratuita,
  mientras la posición en pantalla se actualiza con más frecuencia.
- **Sin Firebase Authentication.** El inicio de sesión compara correo y documento contra el
  documento de Firestore (ver advertencia en [Cómo funciona la app](#cómo-funciona-la-app)).
- **Fechas con el reloj del celular.** Toda marca de tiempo que crea la app usa `Date.now()`
  (la hora del teléfono), no la del servidor, y se guarda como número.
- **La semana empieza el lunes.** En Ganancias e Historial, "Hoy", "Semana" y "Mes" se calculan
  con la hora del celular (no la del servidor): el día desde las 00:00, la semana desde el lunes
  a las 00:00 y el mes desde el día 1 a las 00:00. Ambas pantallas usan la misma regla y asignan
  cada viaje a un periodo según su `completedAt`.
- **Solo los viajes pagados suman.** Los totales de Ganancias y el saldo cuentan únicamente viajes
  `paid`; los `completed` con pago pendiente o rechazado se ven en el historial pero no suman.
- **Saldo con agregaciones de Firestore**, sobre todos los viajes pagados y no sobre lo paginado
  del historial. Evita descargar todos los viajes y no depende de un campo acumulado que pueda
  desfasarse; a cambio solo funciona con conexión y no escucha cambios.
- **Cambios de estado con transacciones**, para no pisar lo que haga el pasajero, con un tiempo
  máximo de espera porque sin red Firestore no falla sino que espera.
- **Ruta guardada de forma compacta:** polilínea codificada de hasta 100 puntos (unos cientos de
  bytes), lejos del límite de 1 MiB por documento de Firestore. El detalle del viaje funciona si
  el viaje no trae ruta.
- **Vehículo de solo lectura y documentos sin reaprobación.** Las apps reales exigen reaprobación
  al cambiar de vehículo o de documentos; aquí el vehículo aprobado es de solo lectura (cambiarlo
  implicaría registrarlo y aprobarlo de nuevo) y los documentos se renuevan sin reaprobación,
  porque el taller no la define y las reglas de Firestore impiden que la app cambie `status`.
- **OpenRouteService en lugar de Directions y Distance Matrix de Google.** El enunciado nombra
  Directions API y Distance Matrix API, pero Google las pasó a estado heredado (desde octubre de
  2026 no se pueden habilitar en proyectos nuevos) y su reemplazo, Routes API, exige un proyecto
  de Google Cloud con facturación. Por eso se usa OpenRouteService (datos de OpenStreetMap), que
  ofrece lo mismo que pide el enunciado: *Directions* para la ruta dibujada y *Matrix* para la
  distancia y la duración. Su plan gratuito permite 2.000 solicitudes diarias de Directions y 500
  de Matrix (40 por minuto en ambas). Se llama una sola vez por evento (al ver una solicitud que
  no trae distancia y duración, y al empezar cada tramo), nunca en cada movimiento, como
  recomienda el enunciado. Cuando se dibuja una ruta se muestra la atribución
  "© OpenStreetMap contributors". Todo el acceso está aislado en `src/services/routesServices.js`:
  para cambiar de proveedor (Google, OSRM...) solo hay que reescribir ese archivo.
- **Dependencias del Drawer:** `react-native-reanimated`, `react-native-worklets` y
  `react-native-gesture-handler` son requisitos de `@react-navigation/drawer`; no se usan
  directamente.

## Limitaciones y trabajo pendiente

- **Pasarela de pagos pendiente.** Mercado Pago o Stripe en modo de prueba exigen un backend
  (Node.js/Express o Cloud Functions) que guarde la llave secreta y confirme el pago. Mientras
  tanto, un viaje que no es en efectivo queda `completed` con el pago Pendiente.
- **Notificaciones push pendientes** (Firebase Cloud Messaging), que requieren un *development
  build* y no funcionan en Expo Go.
- **La app del pasajero la entregará la profesora.** Hasta entonces las solicitudes se simulan
  con las [herramientas de desarrollo](#herramientas-de-desarrollo), asumiendo que una solicitud
  es un viaje en estado `requested` con el `driverId` del conductor que la recibe. Reasignar una
  solicitud rechazada a otro conductor no lo resuelve esta app.
- La llave de OpenRouteService viaja dentro de la app (ver
  [Variables de entorno](#variables-de-entorno)) y su plan gratuito tiene cuota diaria; sin llave
  o sin cuota las rutas se reemplazan por una línea recta de respaldo.
- El saldo de Ganancias necesita conexión: las agregaciones de Firestore no funcionan sin red.
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
