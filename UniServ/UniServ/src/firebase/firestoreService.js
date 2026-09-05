import {
  collection, doc, getDoc, getDocs, setDoc, updateDoc, addDoc,
  query, where, orderBy, limit, onSnapshot, serverTimestamp,
} from 'firebase/firestore';
import { db, auth } from './firebase';

// ── Collection refs ───────────────────────────────────────────
const usersCol      = () => collection(db, 'users');
const workersCol    = () => collection(db, 'workers');
const bookingsCol   = () => collection(db, 'bookings');
const complaintsCol = () => collection(db, 'complaints');

// ── User ──────────────────────────────────────────────────────
export async function getOrCreateUser(uid, phone) {
  const ref = doc(db, 'users', uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, { uid, phone, createdAt: serverTimestamp() });
  }
  return (await getDoc(ref)).data();
}

export async function updateUserProfile(uid, data) {
  return setDoc(doc(db, 'users', uid), data, { merge: true });
}

export function subscribeUser(uid, callback) {
  return onSnapshot(doc(db, 'users', uid), (snap) => callback(snap.data()));
}

// ── Workers ───────────────────────────────────────────────────
export async function getAvailableWorkersBySkill(skill) {
  const q = query(
    workersCol(),
    where('isAvailable', '==', true),
    where('status', '==', 'active'),
    where('trade', '==', skill),
    limit(5)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// ── Bookings ──────────────────────────────────────────────────
export async function createBooking(bookingData) {
  const ref = doc(bookingsCol());
  const booking = {
    ...bookingData,
    bookingId: ref.id,
    status: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  await setDoc(ref, booking);
  return { ...booking, id: ref.id };
}

export async function updateBooking(bookingId, data) {
  return updateDoc(doc(db, 'bookings', bookingId), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export function subscribeBooking(bookingId, callback) {
  return onSnapshot(doc(db, 'bookings', bookingId), (snap) => callback(snap.data()));
}

export function subscribeWorkerLocation(workerId, callback) {
  return onSnapshot(doc(db, 'workers', workerId), (snap) => {
    const loc = snap.data()?.location;
    if (loc?.lat && loc?.lng) callback(loc);
  });
}

export function subscribeUserBookings(userId, callback) {
  const q = query(bookingsCol(), where('userId', '==', userId), orderBy('createdAt', 'desc'), limit(20));
  return onSnapshot(q, (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));
}

// ── Complaints ────────────────────────────────────────────────
export async function createComplaint(data) {
  const ref = await addDoc(complaintsCol(), {
    ...data,
    status: 'received',
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export function currentUser() {
  return auth.currentUser;
}
