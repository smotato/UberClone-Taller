import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import {
  // Pestaña 1
  validateProfilePhoto,
  validateFullName,
  validateIdNumber,
  validatePhone,
  validateBirthDate,
  validateSelect,
  validateEmail,
  // Pestaña 2
  validatePlate,
  validateShortText,
  validateYear,
  validateCapacity,
  validateVehiclePhoto,
  // Pestaña 3
  validateLicenseNumber,
  validateDocumentPhoto,
  validateExpiryDate,
  validateInspectionPhoto,
  validateInspectionExpiry,
  validateMercadoPagoEmail,
  validateTerms,
} from '../utils/validators'

const INITIAL_DATA = {
  // Pestaña 1
  profilePhoto: null,
  fullName: '',
  idNumber: '',
  phone: '',
  birthDate: null,
  gender: 'male',
  email: '',
  language: 'es',
  // Pestaña 2
  category: null,
  plate: '',
  brand: '',
  model: '',
  year: '',
  color: null,
  capacity: '',
  vehiclePhoto: null,
  // Pestaña 3
  licenseNumber: '',
  licensePhoto: null,
  licenseExpiry: null,
  soatPhoto: null,
  soatExpiry: null,
  inspectionPhoto: null,
  inspectionExpiry: null,
  mercadoPagoEmail: '',
  terms: false,
}

export const RegistrationContext = createContext(null)

export function RegistrationProvider({ children }) {
  const [data, setData] = useState(INITIAL_DATA)
  const [touched, setTouched] = useState({})

  const setField = useCallback(
    (field, value) => setData((prev) => ({ ...prev, [field]: value })), [])
  const touchField = useCallback(
    (field) => setTouched((prev) => ({ ...prev, [field]: true })), [])

  const errors = useMemo(() => ({
    profilePhoto: validateProfilePhoto(data.profilePhoto),
    fullName:     validateFullName(data.fullName),
    idNumber:     validateIdNumber(data.idNumber),
    phone:        validatePhone(data.phone),
    birthDate:    validateBirthDate(data.birthDate),
    gender:       validateSelect(data.gender),
    email:        validateEmail(data.email),
    language:     validateSelect(data.language),

    category:     validateSelect(data.category),
    plate:        validatePlate(data.plate),
    brand:        validateShortText(data.brand),
    model:        validateShortText(data.model),
    year:         validateYear(data.year),
    color:        validateSelect(data.color),
    capacity:     validateCapacity(data.capacity, data.category),   // depende de category
    vehiclePhoto: validateVehiclePhoto(data.vehiclePhoto),
    }), [data])

  const isPersonalValid =
    !errors.profilePhoto && !errors.fullName && !errors.idNumber && !errors.phone &&
    !errors.birthDate && !errors.gender && !errors.email && !errors.language

  const value = useMemo(
    () => ({ data, errors, touched, setField, touchField, isPersonalValid }),
    [data, errors, touched, setField, touchField, isPersonalValid]
  )
  return <RegistrationContext.Provider value={value}>{children}</RegistrationContext.Provider>
}