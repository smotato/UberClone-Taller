import { collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, query, orderBy } from "firebase/firestore";
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
        CreatedAt: Date.now(),
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

export const updateDriver = async (idDriver, driver) => {
    await updateDoc(doc(db, COLLECTION, idDriver), {
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
            licensePhoto: driver.documents.licensePhoto,
            licenseExpiry: driver.documents.licenseExpiry,
            soatPhoto: driver.documents.soatPhoto,
            soatExpiry: driver.documents.soatExpiry,
            inspectionPhoto: driver.documents.inspectionPhoto,
            inspectionExpiry: driver.documents.inspectionExpiry,
            mercadoPagoEmail: driver.documents.mercadoPagoEmail,
        },
        updatedAt: Date.now(),
    });
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
