import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from '../config/firebaseConfig'

// Sube una imagen local (uri de expo-image-picker) a Firebase Storage
// y devuelve la URL pública de descarga (string) para guardarla en Firestore.
// Ojo: esta función SÍ envía datos a Storage cuando se llama.
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

// Ejemplo concreto: foto de la licencia de un conductor.
// Ruta resultante: drivers/<idDriver>/licensePhoto.jpg
// Uso (por ejemplo al enviar el registro):
//   const url = await uploadLicensePhoto(idDriver, data.licensePhoto)
//   -> guardar `url` en Firestore como documents.licensePhoto
export const uploadLicensePhoto = (idDriver, uri) =>
    uploadImage(uri, `drivers/${idDriver}/licensePhoto.jpg`)
