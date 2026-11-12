// AI-assisted: see docs/AI_LOG.md #25
import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { colors, spacing, radius, typography } from '../../theme/theme'
import { ROUTE_ATTRIBUTION } from '../../services/routesServices'

// Atribución de los datos de la ruta (OpenStreetMap). Se muestra sobre el mapa cada vez que se dibuja una ruta.
// El texto sale de routesServices, así cambia solo si se cambia de proveedor (y no se muestra si es null)
export default function RouteAttribution() {
  if (!ROUTE_ATTRIBUTION) return null

  return (
    // pointerEvents none: no tapa los gestos del mapa
    <View style={styles.badge} pointerEvents="none">
      <Text style={styles.text}>{ROUTE_ATTRIBUTION}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    left: spacing.sm,
    bottom: spacing.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  text: {
    ...typography.caption,
    color: colors.textSecondary,
  },
})
