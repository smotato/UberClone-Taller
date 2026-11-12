# Plan de implementación: Tarifa, viajes, Ganancias e Historial (fase A)

> Documento para Claude Code (terminal). Léelo completo antes de escribir código. Implementa **por pasos**, en el orden de la sección 10. Antes de empezar, resúmeme tu enfoque en 8 a 10 líneas, dime qué documentación vas a consultar y espera mi confirmación. Si algo de este plan contradice el código real del repositorio, o necesitas tocar un archivo que no está aquí, **pregunta antes de improvisar**.

## 0. Reglas generales (obligatorias)

1. **Estructura:** ignora la estructura de rutas de `AGENTS.md` (`src/app/`, Expo Router). Guíate por la estructura real del proyecto: pantallas en `src/screens/`, navegación en `src/navigation/` (React Navigation: Stack, Drawer y Tabs), componentes en `src/components/`, hooks en `src/hooks/`, contextos en `src/context/`, servicios en `src/services/`, utilidades en `src/utils/` y configuración en `src/config/`.
2. El proyecto es Expo SDK 58 (`expo ~58.0.21`, React Native 0.88, `firebase ^13`). Antes de usar cualquier API de Expo, React Native, Firebase o de una librería que no esté ya en el código, consulta la documentación versionada (`https://docs.expo.dev/versions/v58.0.0/`; para Firebase, la documentación oficial de Firestore para la SDK modular). No respondas de memoria. Si necesitas instalar algo, solo con `npx expo install <paquete>` (en principio **no hace falta instalar nada**).
3. **No corras `npx expo lint` ni `npx tsc --noEmit`** (decisión del integrante). Ignora esa regla de `AGENTS.md` y no la menciones en tus resúmenes.
4. **Idioma del código:** identificadores, archivos y claves de traducción en **inglés**; comentarios en **español**.
5. **Marca de IA (exigida por el taller):** cada archivo **nuevo** lleva en su primera línea `// AI-assisted: see docs/AI_LOG.md #N`. En archivos existentes que modifiques, esa misma línea va sobre cada bloque que cambies. Reemplaza `#N` por el número de entrada que te indique el integrante.
6. **No edites `docs/AI_LOG.md` ni `README.md`** (la regla de la semana ya quedó documentada en el README por el integrante). No hagas commit ni push, no crees ramas ni PR.
7. **No toques** `.env`, `.env.example`, `src/config/firebaseConfig.js`, las reglas de Firestore, `src/utils/buildDriver.js` ni la **lógica** de `src/utils/validators.js`.
8. No imprimas ni pegues claves, credenciales ni datos personales reales en ningún mensaje o archivo.
9. **Fechas y relojes:** toda marca de tiempo que cree la app usa la hora del celular con `Date.now()` (un número en milisegundos), igual que `createdAt`, `locationUpdatedAt` y `updatedAt`. **Prohibido** `serverTimestamp()` y no se importa la clase `Timestamp` de Firebase. Al **leer** fechas, usa la tolerancia que ya existe en `toDateOrNull` de `src/utils/profileMappers.js` (valor con `toDate()`, número o texto).
10. No refactorices código existente que no esté listado aquí. Mantén el alcance.

## 1. Qué pide el taller y cómo se reparte (cobertura de archivos)

El taller exige archivos concretos. Esta tabla dice cuáles ya existen, cuáles entran en **esta fase (A)** y cuáles quedan para fases siguientes, para que la fase A deje lista la base que ellos van a usar.

| Pide el taller | Dónde | Estado |
|---|---|---|
| Sesión del conductor con `useContext` | `SessionContext` + `useSession` | Existe |
| Hook `useDriverLocation` | `src/hooks/useDriverLocation.js` | Existe |
| Idioma y AsyncStorage solo para preferencias y sesión | `LanguageContext`, `useStorage` | Existe |
| `src/config/pricing.js` (valores configurables en un solo archivo) | `src/config/pricing.js` | **Fase A** |
| Función pura `calculateFare({ distanceKm, durationMin, category, tip })` → `{ fare, commission, driverEarnings }` | `src/utils/calculateFare.js` | **Fase A** |
| Cada viaje guarda `commissionRate` | modelo de `trips` (sección 4) | **Fase A** |
| Hook `useEarnings` y totales con `useMemo` | `src/hooks/useEarnings.js` | **Fase A** |
| Pantalla Ganancias (hoy, semana, mes + saldo) | `src/screens/EarningsScreen.js` | **Fase A** |
| Historial con `FlatList`, filtros Hoy / Semana / Mes / Rango de fechas y filtro por método de pago, paginado de a 20 | `src/screens/HistoryScreen.js` + `src/hooks/useTripHistory.js` | **Fase A** |
| Detalle del viaje con la ruta dibujada con `Polyline` | `src/screens/TripDetailScreen.js` | **Fase A** |
| Colección `trips` con el modelo de la sección 6 del taller | `src/services/tripServices.js` | **Fase A** |
| Hook `useTripRequests` (solicitudes en tiempo real) y `useCallback` en aceptar / rechazar | `src/hooks/useTripRequests.js` | Fase B |
| Viaje activo con `useContext` (estados `requested` … `cancelled`) | `TripContext` + `useTrip` | Fase B |
| Solicitud entrante (temporizador de 15 s), Viaje en curso, Cobro y resumen | `src/screens/` + rutas del Stack hermanas de `Main` | Fase B |
| Distance Matrix / Directions (una llamada al crear y otra al aceptar) | servicio de rutas | Fase B |
| Pago en efectivo | Fase B; pasarela (Mercado Pago o Stripe) con backend | Fase C |
| Firebase Cloud Messaging | requiere development build | Fase C |

**Esta fase (A) no crea ninguno de los elementos de las fases B y C.** La fase A debe dejar las funciones y el modelo de datos listos para reutilizarlos (por ejemplo, `calculateFare` y la forma del documento de `trips`).

## 2. Contexto del proyecto (estado actual de `main`)

- `EarningsScreen.js` e `HistoryScreen.js` son **provisionales**: solo muestran una tarjeta con el mensaje vacío (`earnings.empty`, `history.empty`). Están registradas en el Drawer (`src/navigation/DriverDrawer.js`) como `Earnings` y `History`.
- **No existe** `src/config/pricing.js`, ni `calculateFare`, ni la colección `trips`, ni servicios, hooks o contexto de viajes. No hay app de pasajero.
- `RootNavigator.js` muestra `Main` (el Drawer) cuando hay sesión; su comentario indica que las pantallas del viaje se agregarán como hermanas de `Main`. `TripDetail` será la primera.
- `src/services/dbServices.js` maneja la colección `Driver` (nombre con mayúscula) y usa `Date.now()` para las marcas de tiempo. `listenDriver` usa `onSnapshot`.
- Componentes reutilizables: `DateField` (`minimumDate` y `maximumDate`), `SelectField`, `LoadingOverlay`, y en `components/profile/` las vistas `InfoRow` y `PhotoThumb` y `formatDate` (`ProfileInfo.js`).
- `src/data/options.js` tiene `CATEGORY_OPTIONS` con los valores `economy`, `xl`, `premium`.
- `react-native-maps` ya se usa en `HomeScreen`. El estilo usa los tokens de `src/theme/theme.js`.
- Dinero: pesos colombianos **enteros**, nunca decimales (taller, sección 5).

## 3. Reglas de negocio (taller, secciones 5 y 6)

1. **Parámetros** (todos en `pricing.js`, nada de números sueltos en otros archivos): tarifa base 3500; valor por km 1200; valor por minuto 250; tarifa mínima 6000; multiplicadores `economy` 1.0, `xl` 1.4, `premium` 1.8; comisión 0.20; redondeo a múltiplos de 100.
2. **Fórmula:** `fare = redondear100( max(mínima, (base + km·valorKm + min·valorMin) · multiplicador) )`; `commission = redondear al entero (fare · comisión)`; `driverEarnings = fare − commission + tip`. La propina **no paga comisión** y va completa al conductor.
3. **Ejemplo que debe cumplirse** (8,5 km, 22 min, sin propina): Económico → tarifa 19.200, comisión 3.840, ganancia 15.360. XL → tarifa 26.900, comisión 5.380, ganancia 21.520.
4. `calculateFare` es **pura** (sin React ni Firebase). Con datos inválidos (categoría desconocida, distancia o duración negativas o no numéricas, propina negativa o decimal) lanza un `Error` claro: es un error de programación, no de usuario. `tip` es opcional y vale 0 por defecto.
5. **Ganancias: solo cuentan los viajes `paid`.** Los totales de dinero (total facturado `fare`, comisiones, propinas y ganancia neta `driverEarnings`) suman **únicamente** viajes con `status` `paid`; el pago en efectivo registrado también deja el viaje en `paid`. Un viaje `completed` con pago pendiente o rechazado **no suma dinero**. El número de viajes y el promedio por viaje (ganancia neta ÷ viajes, entero redondeado; 0 si no hay viajes) se calculan sobre esos mismos viajes `paid`.
6. **Periodos, misma regla en Ganancias e Historial.** Hora local del celular: hoy desde las 00:00; semana desde el **lunes** a las 00:00; mes desde el día 1 a las 00:00. Un viaje pertenece al periodo según su `completedAt` (nunca `createdAt`). Ambas pantallas usan **las mismas funciones** de `dateRanges.js`.
7. **Saldo del conductor:** suma de `driverEarnings` de **todos** los viajes `paid` con pasarela (`paymentMethod` `mercadopago` o `stripe`) **menos** la suma de `commission` de **todos** los viajes `paid` en efectivo (`paymentMethod` `cash`). Puede ser negativo y se muestra así. Es el saldo histórico completo, no de un periodo y **nunca** de lo paginado en el Historial; se calcula con agregaciones de Firestore (6.3).
8. **Historial.** Lista los viajes `completed` y `paid` del conductor, del más reciente al más antiguo (por `completedAt`); los `completed` con pago pendiente o rechazado aparecen con su estado de pago, pero no suman dinero en Ganancias. Filtros: Hoy, Semana, Mes, Rango de fechas y método de pago (Todos, Efectivo, Mercado Pago, Stripe). Se pagina de a **20** con `onEndReached`. Sin viajes en el filtro elegido se muestra un mensaje vacío, no una lista en blanco.
9. **Rango de fechas:** dos `DateField` (desde y hasta) con `maximumDate` hoy. Validaciones con el patrón del proyecto: errores **debajo de cada campo**, no en un `Alert`. Ambas fechas son obligatorias y "desde" no puede ser posterior a "hasta". El rango incluye completo el día "hasta" (hasta las 23:59:59.999).
10. **Cada elemento** del historial muestra: fecha y hora, origen → destino, categoría, tarifa, ganancia neta y estado del pago (Aprobado, Pendiente, Rechazado o Efectivo). Al tocarlo abre el detalle.
11. **Detalle del viaje:** mapa con la ruta guardada dibujada con `Polyline` (ajustada a la vista), marcadores de origen y destino, y duración, distancia, tarifa, comisión (con el porcentaje del viaje), propina, ganancia neta, método y estado de pago, y calificación del pasajero (si no hay, un guion).
12. **`commissionRate` por viaje:** los cálculos de comisión del historial y del detalle usan el `commissionRate` guardado en cada viaje, **no** el valor actual de `pricing.js`.
13. **Errores de red:** una carga fallida muestra un mensaje con botón Reintentar dentro de la pantalla (no un `Alert`), y no borra lo ya cargado.

## 4. Modelo de datos: colección `trips`

Colección `trips` (nombre en minúscula, como pide el taller). Marcas de tiempo como número (`Date.now()`).

| Campo | Tipo | Notas |
|---|---|---|
| `driverId`, `passengerId` | string | `driverId` es el ID del documento del conductor |
| `origin`, `destination` | object | `{ lat, lng, address }` |
| `route` | string o null | Ruta compacta: **polilínea codificada** (algoritmo de Google, precisión 5) de, como máximo, 100 puntos tras reducirla. Pesa unos cientos de bytes, muy lejos del límite de 1 MiB por documento. Puede faltar o ser `null` |
| `distanceKm`, `durationMin` | number | |
| `category` | string | `economy`, `xl`, `premium` |
| `fare`, `commission`, `tip`, `driverEarnings` | number | pesos enteros |
| `commissionRate` | number | p. ej. `0.2` |
| `paymentMethod` | string | `mercadopago`, `stripe`, `cash` |
| `paymentStatus` | string | `approved`, `pending`, `rejected`, `cash` |
| `paymentId` | string o null | respuesta de la pasarela |
| `status` | string | `requested`, `accepted`, `driver_arriving`, `in_progress`, `completed`, `paid`, `cancelled` |
| `rating` | number o null | de 1 a 5 |
| `createdAt`, `completedAt` | number | `completedAt` es `null` hasta que termina |
| `isDemo` | boolean | solo en viajes de ejemplo (sección 6.5) |

## 5. Archivos y su ubicación

### Nuevos

| Archivo | Por qué va ahí |
|---|---|
| `src/config/pricing.js` | Único lugar de las tarifas, el multiplicador y la comisión (taller, sección 5) |
| `src/utils/calculateFare.js` | Función pura de tarifa, usada luego por la solicitud entrante y el cierre del viaje |
| `src/utils/formatCurrency.js` | Formato de pesos colombianos enteros para todas las pantallas |
| `src/utils/dateRanges.js` | Funciones puras: inicio de hoy / semana / mes y rango de un filtro |
| `src/utils/polyline.js` | Funciones puras: reducir una lista de puntos, codificarla y decodificarla (polilínea codificada) |
| `src/utils/earningsSummary.js` | Funciones puras: resumen de una lista de viajes y saldo |
| `src/utils/demoTrips.js` | Genera viajes de ejemplo con `calculateFare` (solo desarrollo) |
| `src/services/tripServices.js` | Acceso a Firestore de la colección `trips` |
| `src/hooks/useEarnings.js` | Carga y totales de Ganancias |
| `src/hooks/useTripHistory.js` | Lista paginada y filtros del Historial |
| `src/components/earnings/PeriodCard.js` | Tarjeta de un periodo (hoy, semana o mes) |
| `src/components/earnings/BalanceCard.js` | Tarjeta del saldo |
| `src/components/history/HistoryFilters.js` | Chips de periodo y método de pago + rango de fechas |
| `src/components/history/TripItem.js` | Un elemento de la lista |
| `src/screens/TripDetailScreen.js` | Detalle del viaje con mapa |

### Modificados

| Archivo | Cambio |
|---|---|
| `src/screens/EarningsScreen.js` | Pasa de provisional a la pantalla real |
| `src/screens/HistoryScreen.js` | Pasa de provisional a la pantalla real |
| `src/navigation/RootNavigator.js` | Agrega `TripDetail` como pantalla hermana de `Main` (solo con sesión iniciada) |
| `src/data/options.js` | Agrega `PAYMENT_METHOD_OPTIONS` y `PERIOD_OPTIONS` |
| `src/languages/es.js` y `en.js` | Claves nuevas (sección 8), mismas claves en ambos |

## 6. Especificación por archivo

### 6.1 `pricing.js` y `calculateFare.js`
- `pricing.js` exporta un objeto de configuración con todos los parámetros de 3.1. Sin lógica.
- `calculateFare` sigue 3.2 y 3.4 y devuelve `{ fare, commission, driverEarnings }`, todos enteros. Debe poder importarse sin React ni Firebase.
- `formatCurrency(amount)` devuelve el monto como pesos colombianos enteros (por ejemplo `$19.200`); un negativo conserva el signo. Verifica en la documentación que `Intl`/`toLocaleString` funciona con Hermes en esta versión; si no, formatea a mano con puntos de miles.

### 6.2 `dateRanges.js` y `earningsSummary.js`
- `dateRanges`: `startOfToday`, `startOfWeek` (lunes), `startOfMonth`, `endOfDay` y una función `getRange(filter, customFrom, customTo)` que devuelve `{ from, to }` en milisegundos para `today`, `week`, `month` y `custom`. Recibe la fecha actual como parámetro opcional para poder probarla.
- `earningsSummary`: `summarizeTrips(trips)` → `{ count, billed, commissions, tips, net, average }` (3.5); `splitByPeriod(trips, now)` → resumen de hoy, semana y mes (3.6); `computeBalance(trips)` (3.7, sirve para pruebas y para viajes ya cargados; el saldo de la pantalla sale de las agregaciones de `tripServices.js`). Los resúmenes ignoran todo viaje que no sea `paid` y los que no tienen `completedAt` válido.

### 6.3 `tripServices.js`
- `listenPaidTripsSince(driverId, sinceMs, onChange, onError)`: `onSnapshot` de los viajes del conductor con `completedAt >= sinceMs`; devuelve la función para cancelar la suscripción. **Sin tope de documentos**: se acota por fecha (como mucho, el periodo más antiguo de Ganancias) para que los totales nunca salgan incompletos, y es una consulta aparte del Historial paginado. El filtro por `status === 'paid'` se hace en el cliente para no exigir más índices.
- `fetchTripsPage(driverId, { from, to, paymentMethod, cursor, pageSize = 20 })`: una página ordenada por `completedAt` descendente, con `startAfter(cursor)`; devuelve `{ trips, cursor, hasMore }`. Solo `completed` y `paid` (filtra en el cliente; si una página queda corta por el filtro, sigue pidiendo hasta completar la página o agotar los datos).
- `getTripsBalance(driverId)`: saldo de 3.7 sobre **todos** los viajes `paid`, con consultas de agregación (`getAggregateFromServer` con `sum`, ya disponibles en la SDK instalada). Son tres consultas en paralelo, cada una solo con filtros de igualdad (`driverId`, `status == 'paid'` y `paymentMethod`): `sum(driverEarnings)` para `mercadopago`, `sum(driverEarnings)` para `stripe` y `sum(commission)` para `cash`; saldo = pasarela − efectivo. Una **cuarta consulta** cuenta todos los viajes `paid` (`count()`); cada una de las tres anteriores también devuelve su `count()`. Si el total no coincide con la suma de lo cubierto por las tres (por ejemplo, un `paymentMethod` distinto), se devuelve `mismatch: true` y la pantalla muestra un aviso de descuadre. Las cuatro consultas van en `Promise.all`: **si una falla, la función lanza error y el saldo muestra error completo con Reintentar, nunca un total parcial**. Las agregaciones solo funcionan **en línea** y no admiten listeners, por eso el saldo se recarga explícitamente (6.4). Si algo no funciona como dice la documentación, **pregunta** antes de cambiar de enfoque.
- **Montos siempre numéricos:** al cerrar un viaje, `fare`, `commission`, `tip` y `driverEarnings` se guardan como números enteros calculados con `buildTripAmounts` (en `calculateFare.js`), junto con `commissionRate`; `assertTripAmounts` lo comprueba antes de escribir. Las agregaciones ignoran los valores no numéricos, así que cualquier otro tipo falsearía el saldo. Las fases siguientes (cierre del viaje) deben usar esas mismas funciones.
- `addDemoTrips(driverId, trips)` y `removeDemoTrips(driverId)`: solo para la herramienta de desarrollo de 6.5; el borrado solo toca los documentos con `isDemo === true`.
- **Índices:** las consultas necesitan índices compuestos de Firestore (por ejemplo `driverId` + `completedAt` descendente, y `driverId` + `paymentMethod` + `completedAt` descendente). Firestore muestra en consola un error con el enlace para crearlos. **No los crees ni toques las reglas:** avísame cuál enlace salió y espera.

### 6.4 Hooks
- **`useEarnings`:** usa `useSession` para el `driverId`; se suscribe con `listenPaidTripsSince` desde el inicio del periodo más antiguo (el menor entre inicio de semana e inicio de mes) y carga el saldo con `getTripsBalance`. Devuelve `{ today, week, month, balance, balanceError, balanceMismatch, loading, error, reload, reloadBalance }`. Los totales de periodo salen de esa consulta aparte (no del Historial paginado) y se calculan con **`useMemo`** sobre la lista (taller, sección 5). Cancela la suscripción en la función de limpieza del `useEffect`. Como los periodos dependen de la hora, recalcula al volver la pantalla al foco.
  - **El saldo se recarga** (la agregación no escucha cambios): (1) al enfocar la pantalla (`useFocusEffect` de React Navigation; consulta su documentación), (2) cuando la suscripción de periodos recibe un viaje `paid` nuevo, lo que cubre el cierre de un cobro con la pantalla ya montada, y (3) con el gesto de actualizar (`RefreshControl`) y el botón Reintentar. `reload` queda expuesto para que la fase B lo llame al cerrar un cobro.
  - **El saldo es todo o nada:** si cualquiera de las consultas falla, `balance` queda en `null` y se muestra el error completo con Reintentar; el error del saldo no oculta los totales de periodo.
  - **Descuadre:** si `getTripsBalance` devuelve `mismatch`, `BalanceCard` muestra el aviso `earnings.balanceMismatch` junto al saldo.
- **`useTripHistory(filters)`:** estado `trips`, `loading`, `loadingMore`, `hasMore`, `error`. Devuelve también `loadMore`, `refresh` y `retry`, definidos con **`useCallback`**. Al cambiar los filtros reinicia la lista y el cursor. Ignora respuestas viejas (si los filtros cambian mientras carga, descarta el resultado anterior).

### 6.5 Viajes de ejemplo (solo desarrollo)
No hay app de pasajero, así que hay que poder generar datos para ver las pantallas. `demoTrips.js` produce unos **15 viajes** repartidos entre hoy, esta semana, este mes y meses anteriores, con las tres categorías, los tres métodos de pago, estados de pago variados, propinas, calificaciones, direcciones ficticias y un campo `route` codificado con `polyline.js` a partir de unos 20 puntos alrededor de la última ubicación del conductor (o de una coordenada fija si no existe); dos de los viajes de ejemplo **no llevan ruta** (`route: null`) para probar ese caso. Cada tarifa sale de `calculateFare` con el **mismo** `commissionRate` de `pricing.js`, y todos llevan `isDemo: true`. En `EarningsScreen`, y **solo si `__DEV__` es verdadero**, se muestran dos botones pequeños: "Cargar viajes de ejemplo" y "Borrar viajes de ejemplo". **Pregúntame antes de crear esa herramienta si Firestore rechaza la escritura** (las reglas no se tocan).

### 6.6 Pantallas
- **EarningsScreen:** `ScrollView` con `BalanceCard` y tres `PeriodCard` (Hoy, Esta semana, Este mes). `PeriodCard` muestra los seis datos de 3.5. Estados: cargando (indicador), error con Reintentar (el del saldo es independiente del de los periodos), y vacío (`earnings.empty`) cuando no hay ningún viaje `paid`.
- **HistoryScreen:** `HistoryFilters` arriba (chips de periodo y de método de pago; con "Rango" aparecen los dos `DateField`) y debajo un `FlatList` de `TripItem` con `onEndReached` (umbral razonable), pie con indicador al cargar más y `refreshControl`. Vacío según 3.8. Tocar un elemento navega a `TripDetail` con el `tripId` y el viaje ya cargado como parámetro.
- **TripDetailScreen:** recibe el viaje por parámetro. Decodifica `route` con `polyline.js` y dibuja la `Polyline`, con `fitToCoordinates` para encuadrar y marcadores de origen y destino. **Debe funcionar si el viaje no trae ruta** (`route` ausente, `null`, vacía o inválida): no dibuja la línea y encuadra los marcadores de origen y destino si existen; si tampoco hay coordenadas, oculta el mapa y muestra solo los datos con la nota `tripDetail.noRoute`. Nunca debe fallar por una ruta mal formada. Cabecera con botón para volver. Los datos con `InfoRow` de `components/profile/ProfileInfo.js`. Se reutilizan solo las vistas ya existentes, sin modificarlas.
- **Estilo:** tokens de `src/theme/theme.js`, mismas tarjetas, chips y botones en píldora que el resto de la app. Montos con `formatCurrency`. La fecha y la hora con `toLocaleDateString` y `toLocaleTimeString` según el idioma (`es-CO` o `en-US`).

## 7. Navegación

`TripDetail` se registra en `RootNavigator.js` dentro de la rama `loggedIn`, como hermana de `Main`, con cabecera propia (fondo `colors.primary`, texto `colors.textOnPrimary`) y título `tripDetail.title`. Ninguna otra pantalla de las fases B y C se agrega ahora.

## 8. Textos (es y en, mismas claves)

No dupliques claves existentes (`earnings.title`, `earnings.empty`, `history.title`, `history.empty`, `drawer.*`, `options.category.*`). Valores en español; en inglés el equivalente.

```
earnings (agregar):
  balance           'Saldo'
  balanceHint       'Ganancias por pagos de la pasarela menos comisiones de viajes en efectivo.'
  today             'Hoy'
  week              'Esta semana'
  month             'Este mes'
  trips             'Viajes'
  billed            'Total facturado'
  commissions       'Comisiones'
  tips              'Propinas'
  net               'Ganancia neta'
  average           'Promedio por viaje'
  loadError         'No pudimos cargar tus ganancias. Revisa tu conexión.'
  balanceError      'No pudimos calcular tu saldo. Revisa tu conexión.'
  balanceMismatch   'Algunos viajes pagados no se pudieron incluir en el saldo (método de pago desconocido). Revisa tus datos.'
  retry             'Reintentar'
  loadDemo          'Cargar viajes de ejemplo'
  removeDemo        'Borrar viajes de ejemplo'
history (agregar):
  periodToday / periodWeek / periodMonth / periodCustom   'Hoy' / 'Semana' / 'Mes' / 'Rango'
  paymentAll / paymentCash / paymentMercadoPago / paymentStripe   'Todos' / 'Efectivo' / 'Mercado Pago' / 'Stripe'
  from              'Desde'
  to                'Hasta'
  selectDate        'Selecciona la fecha'
  emptyFiltered     'No tienes viajes en este filtro.'
  loadError         'No pudimos cargar tus viajes. Revisa tu conexión.'
  retry             'Reintentar'
  loadingMore       'Cargando más viajes...'
tripDetail (nuevo):
  title / distance / duration / fare / commission / tip / earnings / paymentMethod / paymentStatus / rating / noRating / noRoute
  (Detalle del viaje / Distancia / Duración / Tarifa / Comisión / Propina / Ganancia neta / Método de pago / Estado del pago / Calificación del pasajero / Sin calificación / Este viaje no tiene ruta guardada.)
paymentStatus (nuevo):
  approved 'Aprobado' · pending 'Pendiente' · rejected 'Rechazado' · cash 'Efectivo'
errors (agregar):
  rangeIncomplete   'Selecciona la fecha'
  rangeInvalid      'La fecha "desde" no puede ser posterior a "hasta"'
```

Para las unidades (`km`, `min`) usa un texto con parámetro en el propio componente, sin romper el formato de `t(key)`, que no recibe parámetros.

## 9. Fuera de alcance (no lo hagas)

- Solicitud entrante, viaje en curso, cobro y resumen del viaje, `useTripRequests`, `TripContext` y cualquier cambio en `HomeScreen`, el interruptor de disponibilidad o la ubicación.
- Distance Matrix, Directions, Nominatim u OSRM.
- Pasarela de pagos (Mercado Pago o Stripe), backend, Cloud Functions y Firebase Cloud Messaging.
- Cambiar `Driver`, el perfil, el registro, el login, `status` o `isAvailable`.
- Reglas de Firestore, `.env`, `firebaseConfig.js`, índices (solo se me avisa el enlace).
- Editar o borrar viajes reales, y mostrar viajes cancelados o rechazados en el historial.

## 10. Orden de implementación (con puntos de control)

1. **Paso 1:** `pricing.js`, `calculateFare.js` y `formatCurrency.js`. **Punto de control 1:** verifica con un script temporal **fuera del repositorio** (en tu carpeta de trabajo temporal) el ejemplo del taller y los bordes: Económico 19.200 / 3.840 / 15.360; XL 26.900 / 5.380 / 21.520; Premium; un viaje corto que cae en la tarifa mínima; propina; y datos inválidos que lanzan error. Muéstrame los resultados y espera mi OK. No hace falta Expo Go.
2. **Paso 2:** `dateRanges.js`, `earningsSummary.js` y `polyline.js`. Verifica con otro script temporal: límites de hoy, semana (lunes) y mes, el cambio de mes en mitad de la semana, viajes `completed` que no suman, promedio con 0 viajes, saldo negativo, y que codificar y decodificar una ruta devuelve los mismos puntos (con precisión de 5 decimales), que se reduce a 100 puntos como máximo y que una cadena inválida o `null` devuelve una lista vacía sin lanzar error.
3. **Paso 3:** `tripServices.js` y `demoTrips.js`. Consulta la documentación de Firestore (consultas, cursores, límites, agregaciones e índices) antes de escribir.
4. **Paso 4:** claves de traducción en `es.js` y `en.js`, y `PAYMENT_METHOD_OPTIONS` y `PERIOD_OPTIONS` en `options.js`.
5. **Paso 5:** `useEarnings`, `PeriodCard`, `BalanceCard` y `EarningsScreen` con los botones de viajes de ejemplo. **Punto de control 2:** cargar los viajes de ejemplo y ver los totales, el saldo y los estados vacío, de carga y de error. Dime cómo probarlo en Expo Go y espera mi OK.
6. **Paso 6:** `useTripHistory`, `HistoryFilters`, `TripItem` y `HistoryScreen`. Avísame del enlace de cada índice que Firestore pida.
7. **Paso 7:** `TripDetailScreen` y la ruta en `RootNavigator.js`.
8. **Paso 8:** resumen con los archivos creados o modificados, las decisiones que tomaste y cómo probar cada criterio de la sección 11 en Expo Go.

Al terminar **cada paso**, lista los archivos que tocaste y sigue con el siguiente sin esperar confirmación, **excepto** en los dos puntos de control.

## 11. Criterios de aceptación (pruebas manuales)

1. `calculateFare` cumple el ejemplo del taller y los casos del paso 1 (sin Expo Go).
2. Con viajes de ejemplo cargados, Ganancias muestra hoy, semana y mes con los seis datos, y los números coinciden con los viajes (revisa en la consola de Firestore).
3. Los viajes `completed` con pago pendiente o rechazado aparecen en el Historial con su estado, pero no cambian ningún total de Ganancias. El saldo suma las ganancias de la pasarela y resta las comisiones en efectivo de **todos** los viajes `paid` (aunque haya más de 20 en el historial); con más efectivo que pasarela se ve negativo.
4. Sin viajes, Ganancias muestra el mensaje vacío; sin conexión, el error con Reintentar. Con el saldo fallando, se ve el error completo del saldo (nunca un total parcial) y los totales de periodo siguen visibles.
4b. El saldo se actualiza al volver a entrar a Ganancias, al deslizar para actualizar y cuando llega un viaje `paid` nuevo. Un viaje `paid` con un `paymentMethod` inventado (por ejemplo `paypal`) hace aparecer el aviso de descuadre.
5. Historial: lista del más reciente al más antiguo, de a 20; al bajar carga la siguiente página con el indicador al pie, sin repetir ni saltar viajes.
6. Los filtros Hoy, Semana, Mes y Rango, y cada método de pago, devuelven solo lo que corresponde; un filtro sin resultados muestra `history.emptyFiltered`.
7. En Rango, dejar una fecha vacía o poner "desde" posterior a "hasta" muestra el error **debajo del campo**.
8. Cada elemento muestra fecha y hora, origen → destino, categoría, tarifa, ganancia neta y estado del pago.
9. El detalle muestra la ruta dibujada y encuadrada en el mapa, y todos los datos; la comisión usa el porcentaje guardado en el viaje. Un viaje sin ruta (`route: null`) abre sin errores y muestra sus datos.
10. Un viaje que cae en la semana según `completedAt` aparece en Semana tanto en Ganancias como en Historial, y los dos coinciden en el lunes de inicio.
11. Cambiar el idioma desde el perfil cambia todos los textos de estas pantallas y los formatos de fecha.
12. Borrar los viajes de ejemplo elimina solo los que tienen `isDemo`.
13. Ninguno de los archivos prohibidos cambió, y `Driver` no se modificó.

## 12. Notas para el integrante (no son tareas de Claude Code)

- **Reglas de Firestore:** si las reglas actuales no permiten leer o escribir `trips` desde la app, hay que ajustarlas tú. El plan se detiene y te avisa; no las toca.
- **Índices:** crea en la consola los índices compuestos que Firestore indique con su enlace.
- **Simulación:** sin app de pasajero, las pantallas se prueban con viajes de ejemplo. Conviene preguntarle a la profesora si acepta que la fase B simule las solicitudes.
- **Bitácora:** esta funcionalidad lleva su propia entrada, con la marca `#N` que le indiques a Claude Code.
