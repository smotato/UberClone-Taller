// AI-assisted: see docs/AI_LOG.md #8
// AI-assisted: see docs/AI_LOG.md #10

import { Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import { Ionicons } from '@expo/vector-icons'
import useLanguage from '../../hooks/useLanguage'
import { colors, spacing, radius, typography, sizes } from '../../theme/theme'

// Opciones compartidas por la cámara y la galería
// quality 0.7 comprime la imagen para que pese menos al subirla
const PICKER_OPTIONS = {
  mediaTypes: ['images'],
  quality: 0.7,
}

export default function PhotoField({ label, hint, value, onChange, error }) {
  const { t } = useLanguage()

  const takePhoto = async () => {
    // La cámara sí exige permiso; si el usuario lo niega, se le avisa
    const permission = await ImagePicker.requestCameraPermissionsAsync()
    if (!permission.granted) {
      // Título corto y mensaje largo: en Android un título largo se recorta
      Alert.alert(t('common.cameraPermissionTitle'), t('common.cameraPermissionDenied'))
      return
    }
    const result = await ImagePicker.launchCameraAsync(PICKER_OPTIONS)
    // canceled es true si el usuario cerró la cámara sin tomar la foto
    if (!result.canceled) onChange(result.assets[0].uri)
  }

  const pickFromGallery = async () => {
    // La galería abre el selector del sistema y no necesita permiso previo
    const result = await ImagePicker.launchImageLibraryAsync(PICKER_OPTIONS)
    if (!result.canceled) onChange(result.assets[0].uri)
  }

  // Pregunta de dónde sacar la foto: cámara o galería
  const openOptions = () => {
    // El mensaje evita el hueco vacío entre el título y los botones.
    // En Android los botones se muestran en orden inverso al del arreglo,
    // por eso "Tomar foto" va al final para quedar arriba.
    Alert.alert(label, t('common.choosePhotoSource'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.chooseFromGallery'), onPress: pickFromGallery },
      { text: t('common.takePhoto'), onPress: takePhoto },
    ])
  }

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}

      {/* Borde rojo cuando el campo tiene error */}
      <Pressable style={[styles.box, error && styles.boxError]} onPress={openOptions}>
        {value ? (
          <>
            <Image source={{ uri: value }} style={styles.image} />
            {/* Ícono de cámara en la esquina: indica que se puede cambiar la foto */}
            <View style={styles.badge}>
              <Ionicons name="camera" size={sizes.iconSm} color={colors.textOnPrimary} />
            </View>
          </>
        ) : (
          <View style={styles.placeholder}>
            <Ionicons name="camera-outline" size={sizes.iconLg} color={colors.textMuted} />
            <Text style={styles.placeholderText}>{t('common.addPhoto')}</Text>
          </View>
        )}
      </Pressable>

      {/* Mensaje de error debajo del campo */}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  )
}

const styles = StyleSheet.create({
  field: {
    marginBottom: spacing.lg,
  },
  label: {
    ...typography.label,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  hint: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  // Recuadro con borde punteado, el overflow recorta la imagen a las esquinas redondeadas
  box: {
    height: 160,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.borderStrong,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  // Borde rojo cuando el campo tiene error (mantiene el punteado)
  boxError: {
    borderColor: colors.error,
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
    marginTop: spacing.xs,
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  placeholderText: {
    ...typography.caption,
    color: colors.textMuted,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  badge: {
    position: 'absolute',
    right: spacing.sm,
    bottom: spacing.sm,
    width: 32,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
})