// AI-assisted: see docs/AI_LOG.md #17

import { ActivityIndicator, Modal, StyleSheet, Text, View } from 'react-native'
import { colors, spacing, radius, typography, shadows } from '../theme/theme'

// Capa que cubre toda la pantalla mientras se completa una operación
export default function LoadingOverlay({ visible, message }) {
  return (
    // onRequestClose vacío: en Android el botón atrás no debe cerrar el loader
    <Modal visible={visible} transparent animationType="fade" onRequestClose={() => {}}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <ActivityIndicator size="large" color={colors.primary} />
          {message ? <Text style={styles.message}>{message}</Text> : null}
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.overlay,
    padding: spacing.xl,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.xxl,
    alignItems: 'center',
    gap: spacing.lg,
    ...shadows.floating,
  },
  message: {
    ...typography.body,
    color: colors.text,
    textAlign: 'center',
  },
})