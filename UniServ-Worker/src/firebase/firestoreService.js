import {
  doc, getDoc, setDoc, updateDoc, collection, query,
  where, orderBy, limit, onSnapshot, serverTimestamp,
} from 'firebase/firestore';
import { db, auth } from './firebase';

export const workersCol    = () => collection(db, 'workers');
export const bookingsCol   = () => collection(db, 'bookings');
export const assessmentsCol = () => collection(db, 'assessments');

export async function createWorkerProfile(uid, data) {
  return setDoc(doc(db, 'workers', uid), {
    uid, ...data,
    kycStatus: 'pending',
    assessmentStatus: 'unassigned',
    status: 'pending_verification',
    isAvailable: false,
    rating: 0,
    jobsCompleted: 0,
    createdAt: serverTimestamp(),
  });
}

export async function updateWorkerProfile(uid, data) {
  return setDoc(doc(db, 'workers', uid), { ...data, updatedAt: serverTimestamp() }, { merge: true });
}

export function subscribeWorkerProfile(uid, callback) {
  return onSnapshot(doc(db, 'workers', uid), (snap) => callback(snap.data()));
}

export async function broadcastLocation(uid, lat, lng) {
  return updateDoc(doc(db, 'workers', uid), {
    location: { lat, lng, updatedAt: serverTimestamp() },
  });
}

export async function setWorkerAvailability(uid, isAvailable) {
  return updateDoc(doc(db, 'workers', uid), { isAvailable });
}

export function subscribeIncomingJobs(workerId, callback) {
  const q = query(bookingsCol(), where('workerId', '==', workerId), where('status', '==', 1));
  return onSnapshot(q, (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));
}

export function subscribeActiveJob(workerId, callback) {
  const q = query(bookingsCol(), where('workerId', '==', workerId), where('status', 'in', [1,2,3,4]), limit(1));
  return onSnapshot(q, (snap) => callback(snap.empty ? null : { id: snap.docs[0].id, ...snap.docs[0].data() }));
}

export async function acceptBooking(bookingId) {
  return updateDoc(doc(db, 'bookings', bookingId), { status: 2, updatedAt: serverTimestamp() });
}

export async function declineBooking(bookingId, reason) {
  return updateDoc(doc(db, 'bookings', bookingId), {
    status: 0, workerId: null, declineReason: reason, updatedAt: serverTimestamp(),
  });
}

export async function updateBookingStatus(bookingId, status, extra = {}) {
  return updateDoc(doc(db, 'bookings', bookingId), { status, ...extra, updatedAt: serverTimestamp() });
}

export async function verifyStartOtp(bookingId, enteredOtp) {
  const snap = await getDoc(doc(db, 'bookings', bookingId));
  if (snap.data()?.startOtp === enteredOtp) {
    await updateBookingStatus(bookingId, 3);
    return true;
  }
  return false;
}

export async function verifyCompletionOtp(bookingId, enteredOtp) {
  const snap = await getDoc(doc(db, 'bookings', bookingId));
  if (snap.data()?.completionOtp === enteredOtp) {
    await updateBookingStatus(bookingId, 5);
    return true;
  }
  return false;
}

export async function getAssessmentByToken(token) {
  const q = query(assessmentsCol(), where('token', '==', token), limit(1));
  const snap = await getDocs(q);
  return snap.empty ? null : { id: snap.docs[0].id, ...snap.docs[0].data() };
}

export function subscribeJobHistory(workerId, callback) {
  const q = query(bookingsCol(), where('workerId', '==', workerId), where('status', '==', 5), orderBy('updatedAt', 'desc'), limit(30));
  return onSnapshot(q, (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));
}

export const currentUser = () => auth.currentUser;
