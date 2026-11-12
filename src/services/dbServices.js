import { collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, query, orderBy, where, limit, onSnapshot } from "firebase/firestore";
import { db } from '../config/firebaseConfig'

const COLLECTION = 'Driver'

// Genera un ID de documento sin escribir nada todavía
export const newDriverId = () => doc(collection(db, COLLECTION)).id

export const addDriver = async (driver, id = newDriverId()) => {
    const ref = doc(db, COLLECTION, id)
    await setDoc(ref, {
        profilePhotoURL: driver.profilePhotoURL,
        fullName: driver.fullName,
        idNumber: driver.idNumber,
        phone: driver.phone,
        birthDate: driver.birthDate,
        gender: driver.gender,
        email: driver.email,
        language: driver.language,
        vehicle: {
            category: driver.vehicle.category,
            plate: driver.vehicle.plate,
            brand: driver.vehicle.brand,
            model: driver.vehicle.model,
            year: driver.vehicle.year,
            color: driver.vehicle.color,
            capacity: driver.vehicle.capacity,
            vehiclePhotoURL: driver.vehicle.vehiclePhotoURL,
        },
        documents: {
            licenseNumber: driver.documents.licenseNumber,
            licensePhotoURL: driver.documents.licensePhotoURL,
            licenseExpiry: driver.documents.licenseExpiry,
            soatPhotoURL: driver.documents.soatPhotoURL,
            soatExpiry: driver.documents.soatExpiry,
            inspectionPhotoURL: driver.documents.inspectionPhotoURL,
            inspectionExpiry: driver.documents.inspectionExpiry,
            mercadoPagoEmail: driver.documents.mercadoPagoEmail,
        },
        status: 'pending',
        // AI-assisted: see docs/AI_LOG.md #20
        // El conductor nuevo nace no disponible, para que el campo nunca esté ausente
        isAvailable: false,
        createdAt: Date.now(),
    });
    return ref.id;
};

/*export const getDrivers = async () => {
    const q = query(collection(db, COLLECTION), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}*/

export const getDriver = async (idDriver) => {
    const snap = await getDoc(doc(db, COLLECTION, idDriver));
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

// AI-assisted: see docs/AI_LOG.md #22
// Campos que el perfil nunca debe modificar; "vehicle" cubre también cualquier "vehicle.*"
const PROTECTED_FIELDS = [
    'status', 'isAvailable', 'location', 'locationUpdatedAt', 'createdAt', 'termsAcceptedAt',
    'idNumber', 'birthDate', 'fullName', 'gender', 'profilePhotoURL',
    'vehicle', 'documents.licenseNumber',
]

// Tiempo máximo de espera de la escritura del perfil
const PROFILE_WRITE_TIMEOUT_MS = 10000

const isProtectedField =(field) =>
    PROTECTED_FIELDS.some((blocked) => field === blocked || field.startsWith(`${blocked}.`))

// Actualiza solo los campos recibidos, con rutas con punto (p. ej. 'documents.soatExpiry'),
// en un único updateDoc. updatedAt usa la hora del celular, como el resto del archivo
export const updateDriverProfile = async (idDriver, fields) => {
    const allowed = Object.fromEntries(
        Object.entries(fields).filter(([field]) => !isProtectedField(field))
    )
    if (Object.keys(allowed).length === 0) return
    const write = updateDoc(doc(db, COLLECTION, idDriver), {
        ...allowed,
        updatedAt: Date.now(),
    });
    // Sin red, updateDoc no falla: queda esperando. Se corta la espera para poder avisar el error
    let timer
    const timeout = new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error('Tiempo de espera agotado al guardar')), PROFILE_WRITE_TIMEOUT_MS)
    })
    try {
        await Promise.race([write, timeout])
    } finally {
        clearTimeout(timer)
    }
};

export const removeDriver = async (idDriver) => {
    await deleteDoc(doc(db, COLLECTION, idDriver));
};

// Comprueba si ya hay un conductor con ese documento (el ID es automático, así que se consulta por campo)
export const idNumberExists = async (idNumber) => {
  const q = query(collection(db, COLLECTION), where('idNumber', '==', idNumber), limit(1))
  const snap = await getDocs(q)
  return !snap.empty
};

// AI-assisted: see docs/AI_LOG.md #18
// Escucha el documento del conductor en vivo. Llama onChange({ id, ...data }) o onChange(null) si no existe.
// Devuelve la función unsubscribe para cancelar la suscripción.
export const listenDriver = (idDriver, onChange, onError) => {
    return onSnapshot(
        doc(db, COLLECTION, idDriver),
        (snap) => onChange(snap.exists() ? { id: snap.id, ...snap.data() } : null),
        onError
    );
};

// Actualiza solo el campo isAvailable (no toca status ni otros campos)
export const setDriverAvailability = async (idDriver, isAvailable) => {
    await updateDoc(doc(db, COLLECTION, idDriver), { isAvailable });
};

// Guarda la última ubicación del conductor; locationUpdatedAt usa Date.now() como el resto del archivo
export const updateDriverLocation = async (idDriver, { lat, lng }) => {
    await updateDoc(doc(db, COLLECTION, idDriver), {
        location: { lat, lng },
        locationUpdatedAt: Date.now(),
    });
};
