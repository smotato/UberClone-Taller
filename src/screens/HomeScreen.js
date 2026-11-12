// AI-assisted: see docs/AI_LOG.md #19
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { View, Text, Pressable, Switch, StyleSheet, Animated, Alert, Linking } from 'react-native'
import MapView, { Circle } from 'react-native-maps'
import { StatusBar } from 'expo-status-bar'
import { Ionicons } from '@expo/vector-icons'
import { useIsFocused } from '@react-navigation/native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { colors, spacing, radius, typography, shadows, sizes } from '../theme/theme'
import DriverMarker from '../components/DriverMarker'
import useLanguage from '../hooks/useLanguage'
import useSession from '../hooks/useSession'
import useStorage from '../hooks/useStorage'
import useDriverLocation from '../hooks/useDriverLocation'
import { setDriverAvailability, updateDriverLocation } from '../services/driverServices'

// Tamaños puntuales que no existen en el tema
const FAB_SIZE = 48
const STATUS_DOT_SIZE = 12
const STATUS_HALO_SIZE = 22
const SEARCH_BAR_HEIGHT = 3
const SEARCH_BAR_WIDTH = 120

// Región por defecto (Bogotá) mientras no hay ubicación, y zoom al centrar
const DEFAULT_REGION = { latitude: 4.711, longitude: -74.0721, latitudeDelta: 0.05, longitudeDelta: 0.05 }
const FOCUS_DELTA = 0.01
const RECENTER_DURATION_MS = 400

// AI-assisted: see docs/AI_LOG.md #21
// Cada cuánto como máximo se escribe la ubicación en Firestore mientras el conductor está disponible, en milisegundos
const LOCATION_WRITE_MS = 10000

// AI-assisted: see docs/AI_LOG.md #20
// Intentos y espera (en milisegundos) al apagar la disponibilidad en Firestore
const AVAILABILITY_OFF_ATTEMPTS = 3
const AVAILABILITY_OFF_RETRY_MS = 600
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// Círculos de búsqueda alrededor del conductor (radio en metros); color verde con transparencia
const CIRCLES = [
  { radius: 300, fill: `${colors.success}14` },
  { radius: 150, fill: `${colors.success}26` },
]
const CIRCLE_STROKE = `${colors.success}40`

// Aviso según el estado del conductor: fondo suave, color del ícono/texto y texto traducido
const STATUS_NOTICES = {
  pending:  { background: colors.warningSoft, color: colors.text,  icon: 'time',         textKey: 'home.statusPending' },
  rejected: { background: colors.errorSoft,   color: colors.error, icon: 'close-circle', textKey: 'home.statusRejected' },
}

export default function HomeScreen({ navigation }) {
  const { t } = useLanguage()
  const { driver, driverId, driverStatus, isApproved } = useSession()
  const storage = useStorage()
  const insets = useSafeAreaInsets()
  // AI-assisted: see docs/AI_LOG.md #20
  // El foco solo se usa para el color de la barra de estado
  const isFocused = useIsFocused()

  // Disponibilidad que eligió el conductor
  const [available, setAvailable] = useState(false)
  // Último estado guardado en AsyncStorage (null mientras se lee)
  const [storedAvailability, setStoredAvailability] = useState(null)
  // Verdadero mientras se completa la activación; mantiene el interruptor encendido sin rebote visual
  const [activating, setActivating] = useState(false)

  const mapRef = useRef(null)
  const centeredOnce = useRef(false)
  const restoreDone = useRef(false)
  const busy = useRef(false)
  // AI-assisted: see docs/AI_LOG.md #21
  // Última ubicación conocida, usada por el temporizador de escritura en Firestore
  const locationRef = useRef(null)
  const searchAnim = useRef(new Animated.Value(0)).current
  const [panelWidth, setPanelWidth] = useState(0)
  // El mapa ignora animateToRegion hasta que termina de cargar
  const [mapReady, setMapReady] = useState(false)

  // AI-assisted: see docs/AI_LOG.md #20
  // El seguimiento ya no depende del foco. El taller pide detenerlo al "salir de la pantalla", pero se
  // interpreta como salir del flujo del conductor (desmontaje, p. ej. al cerrar sesión), porque el Drawer
  // mantiene Inicio montada al navegar a Ganancias, Historial o Perfil. Como en la app real de Uber Driver,
  // el conductor sigue disponible mientras navega por el menú. Solo se detiene al apagar la disponibilidad,
  // cerrar sesión o desmontar, al apagar el GPS, o si la cuenta deja de estar aprobada.
  // Limitación conocida: el seguimiento es solo en primer plano.
  const tracking = available && isApproved
  // AI-assisted: see docs/AI_LOG.md #21
  // Se vigila la posición si el conductor está disponible y aprobado, o si Inicio está enfocada
  // (el auto se mueve en pantalla aunque esté no disponible, sin escribir nada en Firestore).
  // Con Inicio sin foco y el conductor disponible se baja la frecuencia para ahorrar batería.
  const watching = tracking || isFocused
  const { location, heading, permission, requestPermission, servicesEnabled, checkServices, error } =
    useDriverLocation({ watching, lowRate: !isFocused })

  // El interruptor se bloquea si la cuenta no está aprobada o si el GPS está apagado
  const switchBlocked = !isApproved || servicesEnabled === false

  const firstName = (driver?.fullName ?? '').trim().split(/\s+/)[0]
  const notice = STATUS_NOTICES[driverStatus]

  // Lee una vez el último estado de disponibilidad guardado
  useEffect(() => {
    storage.getLastAvailability()
      .then(setStoredAvailability)
      .catch(() => setStoredAvailability(false))
  }, [storage])

  // Restaura la disponibilidad al abrir solo si estaba activa, la cuenta está aprobada y el permiso ya está concedido
  useEffect(() => {
    if (storedAvailability === null || restoreDone.current || !driverId) return

    if (!storedAvailability) {
      restoreDone.current = true
      return
    }
    if (!isApproved || permission === 'denied') {
      restoreDone.current = true
      storage.saveLastAvailability(false).catch(() => {})
      return
    }
    if (permission === 'granted') {
      restoreDone.current = true
      // AI-assisted: see docs/AI_LOG.md #20
      // busy evita que la reconciliación apague la disponibilidad mientras se restaura
      busy.current = true
      setDriverAvailability(driverId, true)
        .then(() => setAvailable(true))
        .catch(() => storage.saveLastAvailability(false).catch(() => {}))
        .finally(() => { busy.current = false })
    }
  }, [storedAvailability, permission, isApproved, driverId, storage])

  // AI-assisted: see docs/AI_LOG.md #20
  // Reconciliación: si localmente está no disponible, la cuenta está aprobada y el documento en vivo dice
  // true, se corrige en Firestore. No corre durante una activación (busy) ni antes de terminar la restauración.
  useEffect(() => {
    if (!driverId || !isApproved || available || activating) return
    if (busy.current || !restoreDone.current) return
    if (driver?.isAvailable !== true) return
    setDriverAvailability(driverId, false).catch(() => {})
  }, [driverId, isApproved, available, activating, driver?.isAvailable, storedAvailability])

  // Si la cuenta deja de estar aprobada mientras está disponible, se apaga sola
  useEffect(() => {
    if (isApproved || !available) return
    setAvailable(false)
    storage.saveLastAvailability(false).catch(() => {})
    if (driverId) setDriverAvailability(driverId, false).catch(() => {})
  }, [isApproved, available, driverId, storage])

  // Si el servicio de ubicación se apaga mientras está disponible, también se apaga la disponibilidad
  useEffect(() => {
    if (servicesEnabled !== false || !available) return
    setAvailable(false)
    storage.saveLastAvailability(false).catch(() => {})
    if (driverId) setDriverAvailability(driverId, false).catch(() => {})
  }, [servicesEnabled, available, driverId, storage])

  // AI-assisted: see docs/AI_LOG.md #21
  // Mantiene la última ubicación en una referencia para que el temporizador no se reinicie con cada cambio
  useEffect(() => {
    locationRef.current = location
  }, [location])

  // AI-assisted: see docs/AI_LOG.md #21
  // Escribe en Firestore la última posición conocida cada LOCATION_WRITE_MS, solo con el conductor
  // disponible y aprobado (tracking) y aunque esté quieto. Lo que se ve en pantalla se actualiza aparte,
  // con mayor frecuencia. Sin alertas si la escritura falla.
  useEffect(() => {
    if (!tracking || !driverId) return undefined
    const id = setInterval(() => {
      const current = locationRef.current
      if (!current) return
      updateDriverLocation(driverId, { lat: current.latitude, lng: current.longitude }).catch(() => {})
    }, LOCATION_WRITE_MS)
    return () => clearInterval(id)
  }, [tracking, driverId])

  // Centra el mapa la primera vez que llega la ubicación
  useEffect(() => {
    if (!location || !mapReady || centeredOnce.current) return
    centeredOnce.current = true
    mapRef.current?.animateToRegion(
      { ...location, latitudeDelta: FOCUS_DELTA, longitudeDelta: FOCUS_DELTA },
      RECENTER_DURATION_MS
    )
  }, [location, mapReady])

  // Barra de búsqueda animada mientras está disponible; se detiene en la limpieza
  useEffect(() => {
    if (!available) return undefined
    searchAnim.setValue(0)
    const loop = Animated.loop(
      Animated.timing(searchAnim, { toValue: 1, duration: 1600, useNativeDriver: true })
    )
    loop.start()
    return () => loop.stop()
  }, [available, searchAnim])

  // Avisa que el permiso fue negado y ofrece abrir los ajustes del teléfono
  const showPermissionAlert = useCallback(() => {
    Alert.alert(t('home.locationPermissionTitle'), t('home.locationPermissionMessage'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.openSettings'), onPress: () => Linking.openSettings() },
    ])
  }, [t])

  // Cambia la disponibilidad: pide permiso si hace falta y sincroniza con Firestore
  const handleToggle = useCallback(async (next) => {
    if (busy.current || !driverId) return
    busy.current = true
    restoreDone.current = true
    setActivating(next)
    try {
      if (next) {
        if (!isApproved) return
        // Con el servicio de ubicación apagado no se puede activar; el aviso del panel ya lo explica
        const servicesOn = await checkServices()
        if (!servicesOn) return
        const granted = permission === 'granted' || (await requestPermission())
        if (!granted) {
          showPermissionAlert()
          return
        }
        try {
          await setDriverAvailability(driverId, true)
          await storage.saveLastAvailability(true)
          setAvailable(true)
        } catch (e) {
          setAvailable(false)
          Alert.alert(t('home.availabilityError'))
        }
      } else {
        // Se apaga primero en pantalla para detener el seguimiento de inmediato
        setAvailable(false)
        // AI-assisted: see docs/AI_LOG.md #20
        // Reintenta unas pocas veces con una espera corta; si sigue fallando, avisa al conductor
        try {
          await storage.saveLastAvailability(false)
        } catch (e) {
          // Guardar el último estado local es de mejor esfuerzo
        }
        let saved = false
        for (let attempt = 0; attempt < AVAILABILITY_OFF_ATTEMPTS && !saved; attempt += 1) {
          try {
            await setDriverAvailability(driverId, false)
            saved = true
          } catch (e) {
            if (attempt < AVAILABILITY_OFF_ATTEMPTS - 1) await wait(AVAILABILITY_OFF_RETRY_MS)
          }
        }
        if (!saved) Alert.alert(t('home.availabilityError'))
      }
    } finally {
      busy.current = false
      setActivating(false)
    }
  }, [driverId, isApproved, permission, requestPermission, checkServices, showPermissionAlert, storage, t])

  // Centra el mapa en la ubicación actual con una animación corta
  const handleRecenter = useCallback(() => {
    if (!location) return
    mapRef.current?.animateToRegion(
      { ...location, latitudeDelta: FOCUS_DELTA, longitudeDelta: FOCUS_DELTA },
      RECENTER_DURATION_MS
    )
  }, [location])

  const searchTranslate = searchAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-SEARCH_BAR_WIDTH, Math.max(panelWidth, SEARCH_BAR_WIDTH)],
  })

  // TODO: conectar con useEarnings cuando exista; por ahora es un marcador de posición
  const todayAmount = `$ ${(0).toLocaleString('es-CO')}`

  return (
    <View style={styles.container}>
      {/* Texto oscuro de la barra de estado mientras Inicio está enfocada */}
      {isFocused ? <StatusBar style="dark" /> : null}

      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        initialRegion={DEFAULT_REGION}
        onMapReady={() => setMapReady(true)}
        showsMyLocationButton={false}
        showsCompass={false}
        toolbarEnabled={false}
        userInterfaceStyle="light"
      >
        {available && location
          ? CIRCLES.map((circle) => (
              <Circle
                key={circle.radius}
                center={location}
                radius={circle.radius}
                fillColor={circle.fill}
                strokeColor={CIRCLE_STROKE}
                strokeWidth={1}
              />
            ))
          : null}

          {/* AI-assisted: see docs/AI_LOG.md #21 */}
          <DriverMarker coordinate={location} heading={heading} />
      </MapView>

      {/* Barra superior flotante */}
      <View style={[styles.topBar, { top: insets.top + spacing.sm }]}>
        <Pressable
          style={styles.fab}
          onPress={() => navigation.openDrawer()}
          accessibilityRole="button"
          accessibilityLabel={t('home.menu')}
        >
          <Ionicons name="menu" size={sizes.iconMd} color={colors.text} />
        </Pressable>

        <View style={styles.todayPill}>
          <Text style={styles.todayLabel}>{t('home.today')}</Text>
          <Text style={styles.todayAmount}>{todayAmount}</Text>
        </View>

        {/* Espacio del mismo ancho que el botón de menú para centrar la pastilla */}
        <View style={styles.topSpacer} />
      </View>

      {!location ? (
        <View style={[styles.locating, { top: insets.top + spacing.sm + FAB_SIZE + spacing.md }]}>
          <Text style={styles.locatingText}>{t('home.locating')}</Text>
        </View>
      ) : null}

      {/* Parte inferior: botón de recentrar y panel */}
      <View style={[styles.bottom, { paddingBottom: Math.max(insets.bottom, spacing.lg) }]}>
        <Pressable
          style={styles.recenter}
          onPress={handleRecenter}
          accessibilityRole="button"
          accessibilityLabel={t('home.recenter')}
        >
          <Ionicons name="locate" size={sizes.iconMd} color={colors.text} />
        </Pressable>

        <View style={styles.panel} onLayout={(e) => setPanelWidth(e.nativeEvent.layout.width)}>
          {available ? (
            <View style={styles.searchTrack}>
              <Animated.View style={[styles.searchBar, { transform: [{ translateX: searchTranslate }] }]} />
            </View>
          ) : null}

          {notice ? (
            <View style={[styles.notice, { backgroundColor: notice.background }]}>
              <Ionicons name={notice.icon} size={sizes.iconMd} color={notice.color} />
              <Text style={[styles.noticeText, { color: notice.color }]}>{t(notice.textKey)}</Text>
            </View>
          ) : null}

          {/* Aviso cuando el servicio de ubicación (GPS) del teléfono está apagado */}
          {servicesEnabled === false ? (
            <View style={styles.permissionNotice}>
              <Ionicons name="navigate-circle-outline" size={sizes.iconMd} color={colors.text} />
              <View style={styles.permissionBody}>
                <Text style={styles.permissionText}>{t('home.locationServicesOff')}</Text>
                <Pressable
                  onPress={() => Linking.openSettings()}
                  accessibilityRole="button"
                  hitSlop={spacing.sm}
                >
                  <Text style={styles.permissionLink}>{t('common.openSettings')}</Text>
                </Pressable>
              </View>
            </View>
          ) : null}

          {/* Aviso cuando el permiso de ubicación fue negado, con acceso a los ajustes */}
          {servicesEnabled !== false && permission === 'denied' ? (
            <View style={styles.permissionNotice}>
              <Ionicons name="location-outline" size={sizes.iconMd} color={colors.text} />
              <View style={styles.permissionBody}>
                <Text style={styles.permissionText}>{t('home.locationPermissionMessage')}</Text>
                <Pressable
                  onPress={() => Linking.openSettings()}
                  accessibilityRole="button"
                  hitSlop={spacing.sm}
                >
                  <Text style={styles.permissionLink}>{t('common.openSettings')}</Text>
                </Pressable>
              </View>
            </View>
          ) : null}

          <Text style={styles.greeting}>{t('home.greeting')}, {firstName}</Text>

          <View style={styles.statusRow}>
            <View style={styles.statusLabelGroup}>
              {available ? (
                <View style={styles.statusHalo}>
                  <View style={[styles.statusDot, styles.statusDotOn]} />
                </View>
              ) : (
                <View style={[styles.statusDot, styles.statusDotOff]} />
              )}
              <Text style={[styles.statusText, !isApproved && styles.statusTextBlocked]}>
                {available ? t('home.available') : t('home.unavailable')}
              </Text>
            </View>
            <Switch
              value={available || activating}
              onValueChange={handleToggle}
              disabled={switchBlocked}
              trackColor={{
                false: switchBlocked ? colors.disabledBackground : colors.borderStrong,
                true: colors.success,
              }}
              thumbColor={colors.surface}
            />
          </View>

          {!isApproved ? (
            <Text style={[styles.hint, styles.hintBlocked]}>{t('home.availabilityBlocked')}</Text>
          ) : (
            <Text style={styles.hint}>
              {available && error ? t('home.locationError') : available ? t('home.onlineHint') : t('home.offlineHint')}
            </Text>
          )}
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  // Contenedor general; el mapa ocupa toda la pantalla
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // Barra superior flotante
  topBar: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  fab: {
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.floating,
  },
  topSpacer: {
    width: FAB_SIZE,
    height: FAB_SIZE,
  },

  // Pastilla negra con las ganancias del día
  todayPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    ...shadows.floating,
  },
  todayLabel: {
    ...typography.overline,
    color: colors.textDisabled,
    textTransform: 'uppercase',
  },
  todayAmount: {
    ...typography.subtitle,
    color: colors.textOnPrimary,
  },

  // Texto mientras se obtiene la ubicación
  locating: {
    position: 'absolute',
    alignSelf: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    ...shadows.card,
  },
  locatingText: {
    ...typography.caption,
    color: colors.textSecondary,
  },

  // Parte inferior: recentrar encima del panel
  bottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.lg,
  },
  recenter: {
    alignSelf: 'flex-end',
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    ...shadows.floating,
  },

  // Panel inferior flotante
  panel: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.xl,
    ...shadows.floating,
  },

  // Barra de búsqueda en el borde superior del panel
  searchTrack: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: SEARCH_BAR_HEIGHT,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    overflow: 'hidden',
  },
  searchBar: {
    width: SEARCH_BAR_WIDTH,
    height: SEARCH_BAR_HEIGHT,
    backgroundColor: colors.success,
  },

  // Aviso del estado de la cuenta
  notice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.md,
    marginBottom: spacing.lg,
  },
  noticeText: {
    ...typography.bodyStrong,
    flex: 1,
  },

  // Aviso de permiso de ubicación negado
  permissionNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
    marginBottom: spacing.lg,
  },
  permissionBody: {
    flex: 1,
    gap: spacing.xs,
  },
  permissionText: {
    ...typography.label,
    color: colors.text,
  },
  permissionLink: {
    ...typography.label,
    color: colors.accent,
  },

  // Saludo y fila de estado con el interruptor
  greeting: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  statusLabelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexShrink: 1,
  },
  statusDot: {
    width: STATUS_DOT_SIZE,
    height: STATUS_DOT_SIZE,
    borderRadius: radius.full,
  },
  statusDotOff: {
    backgroundColor: colors.textMuted,
  },
  statusDotOn: {
    backgroundColor: colors.success,
  },
  statusHalo: {
    width: STATUS_HALO_SIZE,
    height: STATUS_HALO_SIZE,
    borderRadius: radius.full,
    backgroundColor: colors.successSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusText: {
    ...typography.title,
    color: colors.text,
  },
  statusTextBlocked: {
    color: colors.textDisabled,
  },
  hint: {
    ...typography.body,
    color: colors.textSecondary,
  },
  hintBlocked: {
    ...typography.caption,
    color: colors.textMuted,
  },
})
