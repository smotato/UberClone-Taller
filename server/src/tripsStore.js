// AI-assisted: see docs/AI_LOG.md #29
import { initializeApp } from 'firebase/app'
import { getFirestore, doc, getDoc, runTransaction } from 'firebase/firestore'

// Acceso a la colección "trips" de Firestore con el SDK web y la misma configuración pública que usa la app
// (sin cuenta de servicio ni secretos nuevos). Solo lee viajes y escribe el resultado del pago.

const COLLECTION = 'trips'

// Únicos campos que el backend puede escribir en un viaje. Nunca toca driverId, fare, origin, etc.
const WRITABLE_FIELDS = ['status', 'paymentStatus', 'paymentId', 'paymentStatusDetail', 'paidAt', 'updatedAt']

// El viaje ya no está en el estado esperado (por ejemplo, el pasajero lo canceló o ya se pagó)
export class TripStateError extends Error {
  constructor(status) {
    super(`El viaje está en ${status}`)
    this.name = 'TripStateError'
    this.status = status
  }
}

// Crea la conexión a Firestore a partir de la configuración de Firebase
export function createFirestoreDb(firebaseConfig) {
  const app = initializeApp(firebaseConfig, 'payments-server')
  return getFirestore(app)
}

export function createTripsStore(db) {
  return {
    // Devuelve { id, ...datos } o null si el viaje no existe
    async get(tripId) {
      const snap = await getDoc(doc(db, COLLECTION, tripId))
      return snap.exists() ? { id: snap.id, ...snap.data() } : null
    },

    // Escribe el resultado del pago con una transacción: solo si el viaje sigue en el estado esperado
    // (por defecto 'completed'), para no pisar cambios hechos mientras tanto. Lanza TripStateError si cambió
    async applyResult(tripId, fields, expectedStatus = 'completed') {
      const keys = Object.keys(fields)
      const invalid = keys.filter((key) => !WRITABLE_FIELDS.includes(key))
      if (keys.length === 0 || invalid.length > 0) {
        throw new Error(`Campos no permitidos en el viaje: ${invalid.join(', ') || 'ninguno válido'}`)
      }

      const ref = doc(db, COLLECTION, tripId)
      await runTransaction(db, async (transaction) => {
        const snap = await transaction.get(ref)
        if (!snap.exists()) throw new TripStateError('inexistente')
        const status = snap.data().status
        if (status !== expectedStatus) throw new TripStateError(status)
        transaction.update(ref, fields)
      })
    },
  }
}
