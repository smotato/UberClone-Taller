## Pantalla de Inicio del conductor: paquetes

Paquetes agregados con `npx expo install` para el mapa, la ubicación y el menú lateral:

- `react-native-maps`: mapa a pantalla completa. Funciona en Expo Go sin claves de Google Maps.
- `expo-location`: permiso y lectura de la ubicación en primer plano.
- `@react-navigation/drawer`, `react-native-gesture-handler`, `react-native-reanimated` y
  `react-native-worklets`: menú Drawer (el Drawer exige estos tres últimos).

### Por qué `expo-location`

Se usa `expo-location` (aceptado por la profesora) porque funciona en Expo Go, que es donde se
presenta la app. Toda la lógica de ubicación está aislada en `src/hooks/useDriverLocation.js`:
ningún otro archivo importa la librería. Si más adelante se cambia por
`@react-native-community/geolocation`, solo debe cambiar ese hook.

El seguimiento es solo en primer plano (limitación aceptada).

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

Integrante: Sergio Stiven Motato