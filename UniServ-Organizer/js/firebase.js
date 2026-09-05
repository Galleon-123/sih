// ─────────────────────────────────────────────────────────────
// Firebase Web SDK — Organizer Portal
// Same Firebase project as both mobile apps.
// ─────────────────────────────────────────────────────────────
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import {
  getFirestore, collection, doc, getDoc, getDocs, setDoc, updateDoc,
  onSnapshot, query, where, orderBy, limit, serverTimestamp, addDoc
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';
import {
  getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';

const FIREBASE_CONFIG = {
  apiKey:            'YOUR_API_KEY',
  authDomain:        'YOUR_PROJECT_ID.firebaseapp.com',
  projectId:         'YOUR_PROJECT_ID',
  storageBucket:     'YOUR_PROJECT_ID.appspot.com',
  messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
  appId:             'YOUR_ORGANIZER_APP_ID',
};

const app  = initializeApp(FIREBASE_CONFIG);
const db   = getFirestore(app);
const auth = getAuth(app);

// ── Collection helpers ────────────────────────────────────────
const workersRef    = () => collection(db, 'workers');
const bookingsRef   = () => collection(db, 'bookings');
const assessmentsRef = () => collection(db, 'assessments');
const complaintsRef = () => collection(db, 'complaints');

// ── Auth ──────────────────────────────────────────────────────
export function loginOrganizer(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}
export function logoutOrganizer() {
  return signOut(auth);
}
export function onOrganizerAuth(cb) {
  return onAuthStateChanged(auth, cb);
}

// ── Workers ───────────────────────────────────────────────────
export function subscribeAllWorkers(callback) {
  return onSnapshot(
    query(workersRef(), orderBy('createdAt', 'desc')),
    (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
  );
}

export function subscribePendingWorkers(callback) {
  return onSnapshot(
    query(workersRef(), where('kycStatus', '==', 'pending')),
    (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
  );
}

export async function approveWorkerKyc(workerId) {
  return updateDoc(doc(db, 'workers', workerId), {
    kycStatus: 'verified',
    status: 'active',
    isAvailable: true,
    updatedAt: serverTimestamp(),
  });
}

export async function rejectWorkerKyc(workerId, reason) {
  return updateDoc(doc(db, 'workers', workerId), {
    kycStatus: 'rejected',
    status: 'rejected',
    rejectReason: reason,
    updatedAt: serverTimestamp(),
  });
}

// ── Assessment tokens ─────────────────────────────────────────
export async function assignAssessmentToken(workerId, workerName, trade) {
  const token = 'ASS-' + Math.floor(1000 + Math.random() * 9000);
  const ref = doc(collection(db, 'assessments'));
  await setDoc(ref, {
    token,
    workerId,
    workerName,
    trade,
    status: 'assigned',
    result: null,
    score: null,
    createdAt: serverTimestamp(),
  });
  await updateDoc(doc(db, 'workers', workerId), {
    assessmentToken: token,
    assessmentStatus: 'assigned',
    updatedAt: serverTimestamp(),
  });
  return token;
}

export async function recordAssessmentResult(assessmentId, workerId, result, score) {
  await updateDoc(doc(db, 'assessments', assessmentId), {
    status: 'completed',
    result,
    score,
    completedAt: serverTimestamp(),
  });
  const workerStatus = result === 'pass' ? 'active' : 'rejected';
  return updateDoc(doc(db, 'workers', workerId), {
    assessmentStatus: result === 'pass' ? 'passed' : 'failed',
    status: workerStatus,
    isAvailable: result === 'pass',
    updatedAt: serverTimestamp(),
  });
}

export function subscribeAssessments(callback) {
  return onSnapshot(
    query(assessmentsRef(), orderBy('createdAt', 'desc')),
    (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
  );
}

// ── Bookings dashboard ────────────────────────────────────────
export function subscribeAllBookings(callback) {
  return onSnapshot(
    query(bookingsRef(), orderBy('createdAt', 'desc'), limit(100)),
    (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
  );
}

// ── Complaints ────────────────────────────────────────────────
export function subscribeComplaints(callback) {
  return onSnapshot(
    query(complaintsRef(), orderBy('createdAt', 'desc')),
    (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
  );
}

export async function updateComplaintStatus(complaintId, status) {
  return updateDoc(doc(db, 'complaints', complaintId), { status, updatedAt: serverTimestamp() });
}

export { db, auth, serverTimestamp, doc, updateDoc, getDoc, onSnapshot, query, where, orderBy };
