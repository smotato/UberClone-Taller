// AI-assisted: see docs/AI_LOG.md #19
import React, { useCallback, useState } from 'react'
import { Text, Pressable, ScrollView, StyleSheet } from 'react-native'
import { colors, spacing, radius, typography, sizes } from '../theme/theme'
import useLanguage from '../hooks/useLanguage'
import useSession from '../hooks/useSession'
// AI-assisted: see docs/AI_LOG.md #22
import PersonalSection from '../components/profile/PersonalSection'
import VehicleSection from '../components/profile/VehicleSection'
import DocumentsSection from '../components/profile/DocumentsSection'
import LanguageSection from '../components/profile/LanguageSection'

// Perfil: datos personales editables, vehículo en solo lectura y documentos renovables
export default function ProfileScreen() {
  const { t } = useLanguage()
  const { driver, driverId, logout } = useSession()

  // AI-assisted: see docs/AI_LOG.md #22
  // Sección que está en edición ahora ('personal' | 'documents' | null); solo puede haber una a la vez
  const [editingSection, setEditingSection] = useState(null)
  const handlePersonalEditing = useCallback(
    (editing) => setEditingSection(editing ? 'personal' : null),
    []
  )
  const handleDocumentsEditing = useCallback(
    (editing) => setEditingSection(editing ? 'documents' : null),
    []
  )

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      {/* AI-assisted: see docs/AI_LOG.md #22 */}
      {/* Datos personales */}
      <PersonalSection
        driver={driver}
        driverId={driverId}
        editDisabled={editingSection !== null && editingSection !== 'personal'}
        onEditingChange={handlePersonalEditing}
      />

      {/* Vehículo (solo lectura) */}
      <VehicleSection driver={driver} />

      {/* Documentos; la revisión técnico-mecánica puede ser null */}
      <DocumentsSection
        driver={driver}
        driverId={driverId}
        editDisabled={editingSection !== null && editingSection !== 'documents'}
        onEditingChange={handleDocumentsEditing}
      />

      {/* Configuración: idioma */}
      <LanguageSection driver={driver} driverId={driverId} />

      <Pressable
        style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
        onPress={logout}
        accessibilityRole="button"
      >
        <Text style={styles.buttonText}>{t('drawer.logout')}</Text>
      </Pressable>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  // Contenedor general de la pantalla
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
    gap: spacing.lg,
  },

  // Botón de cerrar sesión: píldora negra con texto blanco, igual que iniciar sesión y enviar registro
  button: {
    height: sizes.buttonHeight,
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPressed: {
    backgroundColor: colors.primaryPressed,
    opacity: 0.92,
  },
  buttonText: {
    ...typography.button,
    color: colors.textOnPrimary,
  },
})
