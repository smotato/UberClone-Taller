// AI-assisted: see docs/AI_LOG.md #6

import { useState } from 'react'
import { FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import useLanguage from '../../hooks/useLanguage'
import { colors, spacing, radius, typography, sizes } from '../../theme/theme'

export default function SelectField({
  label,
  placeholder,
  title,
  options,
  value,
  onChange,
}) {
  const { t } = useLanguage()
  const insets = useSafeAreaInsets()
  // Controla si el modal con la lista está abierto
  const [visible, setVisible] = useState(false)

  // Las opciones traducibles traen labelKey; las fijas (idiomas) traen label
  const getLabel = (option) => (option.labelKey ? t(option.labelKey) : option.label)
  const selected = options.find((option) => option.value === value)

  const handleSelect = (option) => {
    onChange(option.value)
    setVisible(false)
  }

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>

      {/* Se ve como un input pero es un botón que abre el modal */}
      <Pressable style={styles.input} onPress={() => setVisible(true)}>
        <Text
          style={selected ? styles.valueText : styles.placeholderText}
          numberOfLines={1}
        >
          {selected ? getLabel(selected) : placeholder}
        </Text>
        <Ionicons name="chevron-down" size={sizes.iconSm} color={colors.textMuted} />
      </Pressable>

      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={() => setVisible(false)}
      >
        <View style={styles.overlay}>
          {/* Zona oscura: al tocarla se cierra el modal */}
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setVisible(false)} />

          <View style={[styles.sheet, { paddingBottom: insets.bottom + spacing.lg }]}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>{title}</Text>
              <Pressable onPress={() => setVisible(false)} hitSlop={spacing.md}>
                <Ionicons name="close" size={sizes.iconMd} color={colors.text} />
              </Pressable>
            </View>

            <FlatList
              data={options}
              keyExtractor={(option) => option.value}
              renderItem={({ item }) => {
                const isSelected = item.value === value
                return (
                  <Pressable
                    style={({ pressed }) => [styles.option, pressed && styles.optionPressed]}
                    onPress={() => handleSelect(item)}
                  >
                    <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                      {getLabel(item)}
                    </Text>
                    {isSelected && (
                      <Ionicons name="checkmark" size={sizes.iconMd} color={colors.primary} />
                    )}
                  </Pressable>
                )
              }}
            />
          </View>
        </View>
      </Modal>
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
  input: {
    height: sizes.inputHeight,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  valueText: {
    flex: 1,
    fontSize: typography.fontSize.md,
    color: colors.text,
  },
  placeholderText: {
    flex: 1,
    fontSize: typography.fontSize.md,
    color: colors.textMuted,
  },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: colors.overlay,
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingTop: spacing.lg,
    maxHeight: '70%',
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.md,
  },
  sheetTitle: {
    ...typography.subtitle,
    color: colors.text,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  optionPressed: {
    backgroundColor: colors.surfaceMuted,
  },
  optionText: {
    ...typography.body,
    color: colors.text,
  },
  optionTextSelected: {
    fontWeight: typography.fontWeight.bold,
  },
})