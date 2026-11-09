// AI-assisted: see docs/AI_LOG.md #14

export function buildDriver(data) {
  return {
    profilePhoto: data.profilePhoto,           
    fullName: data.fullName,
    idNumber: data.idNumber,
    phone: data.phone,
    birthDate: data.birthDate,
    gender: data.gender,
    email: data.email.trim().toLowerCase(),
    language: data.language,
    vehicle: {
      category: data.category,
      plate: data.plate,
      brand: data.brand,
      model: data.model,
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
      inspectionPhoto: data.inspectionPhoto ?? null,    // opcional según el año: null, nunca undefined
      inspectionExpiry: data.inspectionExpiry ?? null,
      mercadoPagoEmail: data.mercadoPagoEmail.trim().toLowerCase(),
    },
  }
}