// AI-assisted: see docs/AI_LOG.md #16

const CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME
const UPLOAD_PRESET = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET

// Sube una imagen local (uri de expo-image-picker) a Cloudinary
// y devuelve la URL pública (string) para guardarla en Firestore.
export const uploadImage = async (uri, path) => {
    // Tipo de imagen según la extensión de la ruta local (por defecto JPG)
    const type = uri.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg'

    // FormData con un archivo { uri, type, name } es la forma nativa de React Native para subir archivos
    const formData = new FormData()
    formData.append('file', { uri, type, name: 'photo' })
    formData.append('upload_preset', UPLOAD_PRESET)
    // El public_id es la "ruta" en Cloudinary; se quita la extensión para que la URL quede limpia
    formData.append('public_id', path.replace(/\.[^/.]+$/, ''))

    // Se usa XMLHttpRequest porque el fetch global de Expo (expo/fetch) no acepta
    // archivos { uri, type, name } dentro de FormData ("Unsupported FormDataPart implementation").
    // El XHR de React Native sí los envía de forma nativa.
    // No se pone el encabezado Content-Type: React Native lo agrega solo, con el límite correcto
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`)
        xhr.onload = () => {
            let result = {}
            try { result = JSON.parse(xhr.responseText) } catch (e) { /* respuesta no JSON */ }
            if (xhr.status >= 200 && xhr.status < 300 && result.secure_url) {
                resolve(result.secure_url)
            } else {
                reject(new Error(result.error?.message ?? `Cloudinary respondió ${xhr.status}`))
            }
        }
        xhr.onerror = () => reject(new Error('Error de red al subir la imagen a Cloudinary'))
        xhr.ontimeout = () => reject(new Error('Tiempo de espera agotado al subir la imagen'))
        xhr.timeout = 60000
        xhr.send(formData)
    })
};

export const uploadLicensePhoto = (idDriver, uri) =>
    uploadImage(uri, `drivers/${idDriver}/licensePhoto.jpg`)

export const uploadProfilePhoto = (idDriver, uri) =>
    uploadImage(uri, `drivers/${idDriver}/profilePhoto.jpg`)

export const uploadVehiclePhoto = (idDriver, uri) =>
    uploadImage(uri, `drivers/${idDriver}/vehiclePhoto.jpg`)

export const uploadSoatPhoto = (idDriver, uri) =>
    uploadImage(uri, `drivers/${idDriver}/soatPhoto.jpg`)

// AI-assisted: see docs/AI_LOG.md #22
// Sube una foto renovada con un public_id único (marca de tiempo del celular): un preset sin firma
// no garantiza poder sobrescribir el archivo anterior, así que cada renovación crea una imagen nueva
export const uploadRenewedPhoto = (idDriver, name, uri) =>
    uploadImage(uri, `drivers/${idDriver}/${name}-${Date.now()}.jpg`)

// La revisión técnico-mecánica es opcional según el año del vehículo: sin foto devuelve null
export const uploadInspectionPhoto = (idDriver, uri) =>
    uri ? uploadImage(uri, `drivers/${idDriver}/inspectionPhoto.jpg`) : Promise.resolve(null)
