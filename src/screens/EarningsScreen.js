// AI-assisted: see docs/AI_LOG.md #23
import React, { useCallback, useState } from 'react'
import { View, Text, Pressable, ScrollView, RefreshControl, ActivityIndicator, Alert, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors, spacing, radius, typography, shadows, sizes } from '../theme/theme'
import useLanguage from '../hooks/useLanguage'
import useSession from '../hooks/useSession'
import useEarnings from '../hooks/useEarnings'
import BalanceCard from '../components/earnings/BalanceCard'
import PeriodCard from '../components/earnings/PeriodCard'
// AI-assisted: see docs/AI_LOG.md #25
import { addDemoTrips, removeDemoTrips, createDemoRequest } from '../services/tripServices'
import { buildDemoTrips } from '../utils/demoTrips'

// Ganancias: saldo y totales de hoy, esta semana y este mes (solo viajes pagados).
// En modo desarrollo se muestran botones para cargar y borrar viajes de ejemplo, porque no hay app de pasajero
export default function EarningsScreen() {
  const { t } = useLanguage()
  const { driver, driverId } = useSession()
  const earnings = useEarnings()
  const [demoBusy, setDemoBusy] = useState(false)

  // Sin ningún viaje pagado en el periodo y con saldo en cero, se muestra el mensaje vacío
  const isEmpty = !earnings.loading && !earnings.error && !earnings.hasTrips &&
    !earnings.balanceLoading && !earnings.balanceError && !earnings.balanceMismatch && (earnings.balance ?? 0) === 0

  // Solo desarrollo: carga los viajes de ejemplo alrededor de la última ubicación del conductor
  const handleLoadDemo = useCallback(async () => {
    setDemoBusy(true)
    try {
      await addDemoTrips(driverId, buildDemoTrips({ driverId, base: driver?.location ?? null }))
      Alert.alert(t('earnings.demoLoaded'))
    } catch {
      Alert.alert(t('earnings.demoError'))
    } finally {
      setDemoBusy(false)
    }
  }, [driverId, driver, t])

  // Solo desarrollo: borra únicamente los viajes marcados como ejemplo
  const handleRemoveDemo = useCallback(async () => {
    setDemoBusy(true)
    try {
      await removeDemoTrips(driverId)
      Alert.alert(t('earnings.demoRemoved'))
    } catch {
      Alert.alert(t('earnings.demoError'))
    } finally {
      setDemoBusy(false)
    }
  }, [driverId, t])

  // AI-assisted: see docs/AI_LOG.md #25
  // Solo desarrollo: crea una solicitud de viaje de ejemplo para este conductor (no hay app de pasajero).
  // Para recibirla hay que estar aprobado y disponible. La categoría es la del vehículo del conductor
  const handleSimulateRequest = useCallback(async (paymentMethod) => {
    setDemoBusy(true)
    try {
      await createDemoRequest(driverId, {
        base: driver?.location ?? null,
        category: driver?.vehicle?.category,
        paymentMethod,
      })
      Alert.alert(t('dev.simulateDone'))
    } catch {
      Alert.alert(t('dev.simulateError'))
    } finally {
      setDemoBusy(false)
    }
  }, [driverId, driver, t])

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={earnings.reloading} onRefresh={earnings.reload} />}
    >
      <BalanceCard
        balance={earnings.balance}
        loading={earnings.balanceLoading}
        error={earnings.balanceError}
        mismatch={earnings.balanceMismatch}
        onRetry={earnings.reloadBalance}
      />

      {earnings.loading ? (
        <ActivityIndicator style={styles.loader} color={colors.primary} />
      ) : earnings.error ? (
        <View style={styles.errorCard}>
          <Text style={styles.errorText}>{t('earnings.loadError')}</Text>
          <Pressable style={styles.retryButton} onPress={earnings.reload} accessibilityRole="button">
            <Text style={styles.retryText}>{t('earnings.retry')}</Text>
          </Pressable>
        </View>
      ) : isEmpty ? (
        <View style={styles.emptyCard}>
          <Ionicons name="cash-outline" size={sizes.iconLg} color={colors.textMuted} />
          <Text style={styles.emptyTitle}>{t('earnings.title')}</Text>
          <Text style={styles.emptyMessage}>{t('earnings.empty')}</Text>
        </View>
      ) : (
        <>
          <PeriodCard title={t('earnings.today')} summary={earnings.today} />
          <PeriodCard title={t('earnings.week')} summary={earnings.week} />
          <PeriodCard title={t('earnings.month')} summary={earnings.month} />
        </>
      )}

      {/* Solo en modo desarrollo */}
      {__DEV__ ? (
        <View style={styles.demoRow}>
          <Pressable
            style={[styles.demoButton, demoBusy && styles.demoButtonDisabled]}
            onPress={handleLoadDemo}
            disabled={demoBusy}
            accessibilityRole="button"
          >
            <Text style={styles.demoText}>{t('earnings.loadDemo')}</Text>
          </Pressable>
          <Pressable
            style={[styles.demoButton, demoBusy && styles.demoButtonDisabled]}
            onPress={handleRemoveDemo}
            disabled={demoBusy}
            accessibilityRole="button"
          >
            <Text style={styles.demoText}>{t('earnings.removeDemo')}</Text>
          </Pressable>
          {/* AI-assisted: see docs/AI_LOG.md #25 */}
          <Pressable
            style={[styles.demoButton, demoBusy && styles.demoButtonDisabled]}
            onPress={() => handleSimulateRequest('cash')}
            disabled={demoBusy}
            accessibilityRole="button"
          >
            <Text style={styles.demoText}>{t('dev.simulateCash')}</Text>
          </Pressable>
          <Pressable
            style={[styles.demoButton, demoBusy && styles.demoButtonDisabled]}
            onPress={() => handleSimulateRequest('mercadopago')}
            disabled={demoBusy}
            accessibilityRole="button"
          >
            <Text style={styles.demoText}>{t('dev.simulateGateway')}</Text>
          </Pressable>
        </View>
      ) : null}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
    gap: spacing.lg,
  },
  loader: {
    marginVertical: spacing.xl,
  },

  // Mensaje vacío
  emptyCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.sm,
    ...shadows.card,
  },
  emptyTitle: {
    ...typography.subtitle,
    color: colors.text,
  },
  emptyMessage: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },

  // Error de los totales de periodo
  errorCard: {
    backgroundColor: colors.errorSoft,
    borderRadius: radius.lg,
    padding: spacing.xl,
    gap: spacing.md,
  },
  errorText: {
    ...typography.label,
    color: colors.error,
  },
  retryButton: {
    height: sizes.buttonHeight - 12,
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.xl,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  retryText: {
    ...typography.label,
    color: colors.textOnPrimary,
  },

  // Botones de viajes de ejemplo (solo desarrollo): pequeños y con borde
  demoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  demoButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  demoButtonDisabled: {
    opacity: 0.4,
  },
  demoText: {
    ...typography.label,
    color: colors.text,
  },
})
