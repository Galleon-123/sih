/* ============================================================
   UniServ Organizer Portal — Firebase Realtime Data Layer
   Loaded after firebase-app-compat + firebase-firestore-compat CDN scripts.
   ============================================================ */

const FIREBASE_CONFIG = {
  apiKey:            'YOUR_API_KEY',
  authDomain:        'YOUR_PROJECT_ID.firebaseapp.com',
  projectId:         'YOUR_PROJECT_ID',
  storageBucket:     'YOUR_PROJECT_ID.appspot.com',
  messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
  appId:             'YOUR_ORGANIZER_APP_ID',
};

// Initialize once
if (!firebase.apps.length) firebase.initializeApp(FIREBASE_CONFIG);
const db   = firebase.firestore();
const auth = firebase.auth();

// ── Auth ──────────────────────────────────────────────────────
window.UniServAuth = {
  login: (email, pass) => auth.signInWithEmailAndPassword(email, pass),
  logout: () => auth.signOut(),
  onAuthChange: (cb) => auth.onAuthStateChanged(cb),
};

// ── Worker helpers ────────────────────────────────────────────
window.UniServWorkers = {

  subscribeAll: (cb) =>
    db.collection('workers').orderBy('createdAt', 'desc')
      .onSnapshot((snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() })))),

  subscribePending: (cb) =>
    db.collection('workers').where('kycStatus', '==', 'pending')
      .onSnapshot((snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() })))),

  approveKyc: async (workerId) =>
    db.collection('workers').doc(workerId).update({
      kycStatus: 'verified',
      status: 'active',
      isAvailable: true,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    }),

  rejectKyc: async (workerId, reason) =>
    db.collection('workers').doc(workerId).update({
      kycStatus: 'rejected',
      status: 'rejected',
      rejectReason: reason || 'KYC documents incomplete',
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    }),

  update: (workerId, data) =>
    db.collection('workers').doc(workerId).update({
      ...data,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    }),
};

// ── Assessment token helpers ──────────────────────────────────
window.UniServAssessments = {

  subscribeAll: (cb) =>
    db.collection('assessments').orderBy('createdAt', 'desc')
      .onSnapshot((snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() })))),

  assignToken: async (workerId, workerName, trade) => {
    const token = 'ASS-' + Math.floor(1000 + Math.random() * 9000);
    const ref   = db.collection('assessments').doc();
    await ref.set({
      token, workerId, workerName, trade,
      status: 'assigned', result: null, score: null,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
    await db.collection('workers').doc(workerId).update({
      assessmentToken: token,
      assessmentStatus: 'assigned',
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
    return token;
  },

  scheduleAssessment: async (assessmentId, dateTime, assessor) =>
    db.collection('assessments').doc(assessmentId).update({
      status: 'scheduled',
      scheduledDate: dateTime,
      assessor,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    }),

  recordResult: async (assessmentId, workerId, result, score) => {
    await db.collection('assessments').doc(assessmentId).update({
      status: 'completed', result, score,
      completedAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
    return db.collection('workers').doc(workerId).update({
      assessmentStatus: result === 'pass' ? 'passed' : 'failed',
      status: result === 'pass' ? 'active' : 'rejected',
      isAvailable: result === 'pass',
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
  },
};

// ── Bookings dashboard ────────────────────────────────────────
window.UniServBookings = {
  subscribeAll: (cb) =>
    db.collection('bookings').orderBy('createdAt', 'desc').limit(100)
      .onSnapshot((snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() })))),

  subscribeLive: (cb) =>
    db.collection('bookings').where('status', 'in', [1, 2, 3, 4])
      .onSnapshot((snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() })))),
};

// ── Complaints ────────────────────────────────────────────────
window.UniServComplaints = {
  subscribeAll: (cb) =>
    db.collection('complaints').orderBy('createdAt', 'desc')
      .onSnapshot((snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() })))),

  updateStatus: (complaintId, status) =>
    db.collection('complaints').doc(complaintId).update({
      status,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    }),
};

// ── Seed initial workers from local JSON (one-time setup) ─────
window.UniServSeed = {
  seedWorkersFromJson: async (workersArray) => {
    const batch = db.batch();
    workersArray.forEach((w) => {
      const ref = db.collection('workers').doc(w.id || w.workerId || db.collection('workers').doc().id);
      batch.set(ref, {
        ...w,
        kycStatus: w.kycStatus || 'verified',
        assessmentStatus: w.assessmentStatus || 'passed',
        status: w.status || 'active',
        isAvailable: true,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });
    });
    return batch.commit();
  },
};

console.log('[UniServ] Firebase data layer initialized.');
