// AI-assisted: see docs/AI_LOG.md #22
import React from 'react'
import { View } from 'react-native'
import useLanguage from '../../hooks/useLanguage'
import ProfileSection from './ProfileSection'
import { InfoRow, PhotoThumb, LockedNote, thumbRowStyle } from './ProfileInfo'

// Vehículo aprobado: solo lectura, sin botón Editar
export default function VehicleSection({ driver }) {
  const { t } = useLanguage()
  const vehicle = driver?.vehicle ?? {}

  return (
    <ProfileSection title={t('profile.vehicle')}>
      <View style={thumbRowStyle}>
        <PhotoThumb label={t('registration.vehicle.photo')} uri={vehicle.vehiclePhotoURL} locked />
      </View>
      <InfoRow
        label={t('registration.vehicle.category')}
        value={vehicle.category ? t(`options.category.${vehicle.category}`) : null}
        locked
      />
      <InfoRow label={t('registration.vehicle.plate')} value={vehicle.plate} locked />
      <InfoRow label={t('registration.vehicle.brand')} value={vehicle.brand} locked />
      <InfoRow label={t('registration.vehicle.model')} value={vehicle.model} locked />
      <InfoRow label={t('registration.vehicle.year')} value={vehicle.year} locked />
      <InfoRow
        label={t('registration.vehicle.color')}
        value={vehicle.color ? t(`options.color.${vehicle.color}`) : null}
        locked
      />
      <InfoRow label={t('registration.vehicle.capacity')} value={vehicle.capacity} locked />
      <LockedNote text={t('profile.vehicleLocked')} />
    </ProfileSection>
  )
}
