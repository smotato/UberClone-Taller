// AI-assisted: see docs/AI_LOG.md #17

import { ActivityIndicator, Modal, StyleSheet, View } from 'react-native'
import { colors } from '../theme/theme'

// Loader global: solo el círculo sobre un fondo oscurecido que bloquea la pantalla
export default function LoadingOverlay({ visible }) {
  return (
    // onRequestClose vacío: en Android el botón atrás no debe cerrar el loader
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={() => {}}
    >
      <View style={styles.overlay} accessibilityRole="progressbar" accessibilityLiveRegion="polite">
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  // El Modal ya captura los toques, así que la pantalla de atrás queda bloqueada
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    // Velo claro: un círculo negro no se vería sobre un fondo oscuro
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
})
