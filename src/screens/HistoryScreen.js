// AI-assisted: see docs/AI_LOG.md #23
import React, { useCallback, useMemo, useState } from 'react'
import { View, Text, Pressable, FlatList, ActivityIndicator, StyleSheet } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'
import { colors, spacing, radius, typography, shadows, sizes } from '../theme/theme'
import useLanguage from '../hooks/useLanguage'
import useTripHistory from '../hooks/useTripHistory'
import HistoryFilters from '../components/history/HistoryFilters'
import TripItem from '../components/history/TripItem'
import { getRange } from '../utils/dateRanges'

// Historial de carreras: filtros por periodo y método de pago, lista paginada de a 20 y acceso al detalle
export default function HistoryScreen() {
  const { t } = useLanguage()
  const navigation = useNavigation()

  const [period, setPeriod] = useState('week')
  const [paymentMethod, setPaymentMethod] = useState('all')
  const [customFrom, setCustomFrom] = useState(null)
  const [customTo, setCustomTo] = useState(null)
  // Los errores del rango se muestran solo después de que el usuario elige una fecha
  const [rangeTouched, setRangeTouched] = useState(false)

  const history = useTripHistory({ period, customFrom, customTo, paymentMethod })

  // Errores del rango personalizado, debajo de cada campo
  const rangeErrors = useMemo(() => {
    if (period !== 'custom' || !rangeTouched) return {}
    return {
      from: !customFrom
        ? t('errors.dateRequired')
        : customTo && getRange('custom', customFrom, customTo) === null
          ? t('errors.rangeInvalid')
          : null,
      to: !customTo ? t('errors.dateRequired') : null,
    }
  }, [period, rangeTouched, customFrom, customTo, t])

  const handleOpenTrip = useCallback(
    (trip) => navigation.navigate('TripDetail', { tripId: trip.id, trip }),
    [navigation]
  )

  const renderItem = useCallback(
    ({ item }) => <TripItem trip={item} onPress={handleOpenTrip} />,
    [handleOpenTrip]
  )

  const filters = (
    <HistoryFilters
      period={period}
      onPeriodChange={setPeriod}
      paymentMethod={paymentMethod}
      onPaymentMethodChange={setPaymentMethod}
      customFrom={customFrom}
      customTo={customTo}
      onCustomFromChange={(date) => { setCustomFrom(date); setRangeTouched(true) }}
      onCustomToChange={(date) => { setCustomTo(date); setRangeTouched(true) }}
      errors={rangeErrors}
    />
  )

  // Contenido cuando no hay viajes que mostrar: cargando, error, rango incompleto o vacío
  let empty = null
  if (history.loading) {
    empty = <ActivityIndicator style={styles.loader} color={colors.primary} />
  } else if (history.error) {
    empty = (
      <View style={styles.errorCard}>
        <Text style={styles.errorText}>{t('history.loadError')}</Text>
        <Pressable style={styles.retryButton} onPress={history.retry} accessibilityRole="button">
          <Text style={styles.retryText}>{t('history.retry')}</Text>
        </Pressable>
      </View>
    )
  } else if (history.hasRange) {
    empty = (
      <View style={styles.emptyCard}>
        <Ionicons name="time-outline" size={sizes.iconLg} color={colors.textMuted} />
        <Text style={styles.emptyMessage}>{t('history.emptyFiltered')}</Text>
      </View>
    )
  }

  // Pie de la lista: cargando más viajes o error al pedir la siguiente página
  let footer = null
  if (history.loadingMore) {
    footer = (
      <View style={styles.footer}>
        <ActivityIndicator color={colors.primary} />
        <Text style={styles.footerText}>{t('history.loadingMore')}</Text>
      </View>
    )
  } else if (history.error && history.trips.length > 0) {
    footer = (
      <View style={styles.footer}>
        <Text style={styles.errorText}>{t('history.loadError')}</Text>
        <Pressable style={styles.retryButton} onPress={history.retry} accessibilityRole="button">
          <Text style={styles.retryText}>{t('history.retry')}</Text>
        </Pressable>
      </View>
    )
  }

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.content}
      data={history.trips}
      keyExtractor={(trip) => trip.id}
      renderItem={renderItem}
      ItemSeparatorComponent={Separator}
      ListHeaderComponent={filters}
      ListEmptyComponent={empty}
      ListFooterComponent={footer}
      onEndReached={() => history.loadMore()}
      onEndReachedThreshold={0.4}
      refreshing={history.refreshing}
      onRefresh={history.refresh}
      keyboardShouldPersistTaps="handled"
    />
  )
}

// Espacio entre un viaje y el siguiente
function Separator() {
  return <View style={styles.separator} />
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  separator: {
    height: spacing.md,
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
  emptyMessage: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },

  // Error de carga con Reintentar
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

  // Pie de la lista
  footer: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
    gap: spacing.sm,
  },
  footerText: {
    ...typography.caption,
    color: colors.textMuted,
  },
})
