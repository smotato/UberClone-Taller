// AI-assisted: see docs/AI_LOG.md #14
import { isInspectionRequired } from './validators'

export function buildDriver(data) {
  const inspectionApplies = isInspectionRequired(data.year);

  return {
    profilePhoto: data.profilePhoto,           
    fullName: data.fullName.trim(),
    idNumber: data.idNumber,
    phone: data.phone,
    birthDate: data.birthDate,
    gender: data.gender,
    email: data.email.trim().toLowerCase(),
    language: data.language,
    vehicle: {
      category: data.category,
      plate: data.plate,
      brand: data.brand.trim(),
      model: data.model.trim(),
      year: Number(data.year),
      color: data.color,
      capacity: Number(data.capacity),
      photo: data.vehiclePhoto,
    },
    documents: {
      licenseNumber: data.licenseNumber,
      licensePhoto: data.licensePhoto,
      licenseExpiry: data.licenseExpiry,
      soatPhoto: data.soatPhoto,
      soatExpiry: data.soatExpiry,
      inspectionPhoto: inspectionApplies ? (data.inspectionPhoto ?? null) : null,
      inspectionExpiry: inspectionApplies ? (data.inspectionExpiry ?? null) : null,
      mercadoPagoEmail: data.mercadoPagoEmail.trim().toLowerCase(),
    },
  }
}