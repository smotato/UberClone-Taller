import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from '../config/firebaseConfig'

// Sube una imagen local (uri de expo-image-picker) a Firebase Storage
// y devuelve la URL pública de descarga (string) para guardarla en Firestore.
export const uploadImage = async (uri, path) => {
    const response = await fetch(uri)
    const blob = await response.blob()
    const storageRef = ref(storage, path)
    await uploadBytes(storageRef, blob, { contentType: blob.type || 'image/jpeg' })
    return getDownloadURL(storageRef)
};

export const removeImage = async (path) => {
    await deleteObject(ref(storage, path))
};

export const uploadLicensePhoto = (idDriver, uri) =>
    uploadImage(uri, `drivers/${idDriver}/licensePhoto.jpg`)

export const uploadProfilePhoto = (idDriver, uri) =>
    uploadImage(uri, `drivers/${idDriver}/profilePhoto.jpg`)

export const uploadVehiclePhoto = (idDriver, uri) =>
    uploadImage(uri, `drivers/${idDriver}/vehiclePhoto.jpg`)

export const uploadSoatPhoto = (idDriver, uri) =>
    uploadImage(uri, `drivers/${idDriver}/soatPhoto.jpg`)

// La revisión técnico-mecánica es opcional según el año del vehículo: sin foto devuelve null
export const uploadInspectionPhoto = (idDriver, uri) =>
    uri ? uploadImage(uri, `drivers/${idDriver}/inspectionPhoto.jpg`) : Promise.resolve(null)
