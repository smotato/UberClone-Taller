// AI-assisted: see docs/AI_LOG.md #31
import { Platform } from 'react-native'
import * as Notifications from 'expo-notifications'

// Este es el único archivo que importa expo-notifications.
// Solo usa notificaciones LOCALES (la app misma las programa), que sí funcionan en Expo Go.
// Las notificaciones remotas (push) no están disponibles en Expo Go para Android desde el SDK 53.

const REQUESTS_CHANNEL = 'trip-requests'

// Con la app abierta no se muestra el aviso (la pantalla de solicitud entrante ya es visual) pero sí suena.
// Fuera de la app el sistema muestra la notificación por su cuenta
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: false,
    shouldShowList: false,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
})

// Android exige un canal; en Android 13 o superior el permiso solo se puede pedir cuando el canal ya existe
const ensureChannel = async () => {
  if (Platform.OS !== 'android') return
  await Notifications.setNotificationChannelAsync(REQUESTS_CHANNEL, {
    name: 'Solicitudes de viaje',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
  })
}

// Pide permiso si aún no se ha decidido. Devuelve true si se pueden mostrar notificaciones; nunca lanza error
export async function requestNotificationPermission() {
  try {
    await ensureChannel()
    const current = await Notifications.getPermissionsAsync()
    if (current.granted) return true
    if (!current.canAskAgain) return false
    const asked = await Notifications.requestPermissionsAsync()
    return asked.granted
  } catch {
    return false
  }
}

// Muestra al instante una notificación de solicitud nueva; el identificador evita duplicados de una misma solicitud
export async function notifyNewRequest({ requestId, title, body }) {
  try {
    await Notifications.scheduleNotificationAsync({
      identifier: `request-${requestId}`,
      content: {
        title,
        body,
        sound: true,
        data: { type: 'trip_request', requestId },
        ...(Platform.OS === 'android' ? { channelId: REQUESTS_CHANNEL } : {}),
      },
      trigger: null,
    })
  } catch {
    // Un fallo al avisar no debe afectar el flujo del viaje
  }
}

// Quita las notificaciones mostradas (por ejemplo, cuando la solicitud ya no está disponible o el conductor volvió a la app)
export async function clearRequestNotifications() {
  try {
    await Notifications.dismissAllNotificationsAsync()
  } catch {
    // Sin efecto: la notificación se puede quitar a mano
  }
}
