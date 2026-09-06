/* ============================================================
   UniServ Organizer Portal — Firebase Realtime Data Layer
   Loaded after firebase-app-compat + firebase-firestore-compat CDN scripts.
   ============================================================ */

const FIREBASE_CONFIG = {
  apiKey:            'YOUR_API_KEY',
  authDomain:        'YOUR_PROJECT_ID.firebaseapp.com',
  projectId:         'YOUR_PROJECT_ID',
  storageBucket:     'YOUR_PROJECT_ID.firebasestorage.app',
  messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
  appId:             'YOUR_ORGANIZER_APP_ID',
};

// ── Simulation mode ───────────────────────────────────────────
const IS_SIM_MODE = FIREBASE_CONFIG.apiKey === 'YOUR_API_KEY';

if (IS_SIM_MODE) {
  // ── Mock data ───────────────────────────────────────────────
  const _workers = [
    { id: 'w001', name: 'Rajesh Kumar',    trade: 'electrician', phone: '9810001001', city: 'New Delhi', rating: 4.8, jobsCompleted: 142, status: 'active',               kycStatus: 'verified',  isAvailable: true,  isOnline: true,  createdAt: '2025-03-10T08:00:00.000Z', earnings: { today: 850, thisMonth: 14200, total: 98000 } },
    { id: 'w002', name: 'Suresh Yadav',    trade: 'plumber',     phone: '9810001002', city: 'New Delhi', rating: 4.5, jobsCompleted: 98,  status: 'active',               kycStatus: 'verified',  isAvailable: true,  isOnline: false, createdAt: '2025-04-02T09:00:00.000Z', earnings: { today: 0,   thisMonth: 9800,  total: 62000 } },
    { id: 'w003', name: 'Anita Sharma',    trade: 'cleaner',     phone: '9810001003', city: 'New Delhi', rating: 4.9, jobsCompleted: 201, status: 'active',               kycStatus: 'verified',  isAvailable: false, isOnline: true,  createdAt: '2025-02-14T10:00:00.000Z', earnings: { today: 500, thisMonth: 11500, total: 75000 } },
    { id: 'w004', name: 'Mohan Lal',       trade: 'carpenter',   phone: '9810001004', city: 'New Delhi', rating: 4.2, jobsCompleted: 55,  status: 'active',               kycStatus: 'verified',  isAvailable: true,  isOnline: false, createdAt: '2025-05-18T07:00:00.000Z', earnings: { today: 0,   thisMonth: 6200,  total: 31000 } },
    { id: 'w005', name: 'Priya Singh',     trade: 'cleaner',     phone: '9810001005', city: 'New Delhi', rating: 4.6, jobsCompleted: 167, status: 'active',               kycStatus: 'verified',  isAvailable: true,  isOnline: true,  createdAt: '2025-01-20T11:00:00.000Z', earnings: { today: 700, thisMonth: 13000, total: 88000 } },
    { id: 'w006', name: 'Vikram Tiwari',   trade: 'driver',      phone: '9810001006', city: 'New Delhi', rating: 4.1, jobsCompleted: 23,  status: 'pending_verification', kycStatus: 'pending',   isAvailable: false, isOnline: false, createdAt: '2026-08-28T13:00:00.000Z', earnings: { today: 0,   thisMonth: 0,     total: 0    } },
    { id: 'w007', name: 'Geeta Devi',      trade: 'cleaner',     phone: '9810001007', city: 'New Delhi', rating: 4.0, jobsCompleted: 10,  status: 'pending_verification', kycStatus: 'pending',   isAvailable: false, isOnline: false, createdAt: '2026-09-01T09:30:00.000Z', earnings: { today: 0,   thisMonth: 0,     total: 0    } },
    { id: 'w008', name: 'Amit Verma',      trade: 'electrician', phone: '9810001008', city: 'New Delhi', rating: 4.3, jobsCompleted: 31,  status: 'pending_verification', kycStatus: 'pending',   isAvailable: false, isOnline: false, createdAt: '2026-09-03T14:00:00.000Z', earnings: { today: 0,   thisMonth: 0,     total: 0    } },
    { id: 'w009', name: 'Sunita Mishra',   trade: 'plumber',     phone: '9810001009', city: 'New Delhi', rating: 4.7, jobsCompleted: 12,  status: 'pending_verification', kycStatus: 'pending',   isAvailable: false, isOnline: false, createdAt: '2026-09-04T10:00:00.000Z', earnings: { today: 0,   thisMonth: 0,     total: 0    } },
    { id: 'w010', name: 'Deepak Gupta',    trade: 'carpenter',   phone: '9810001010', city: 'New Delhi', rating: 4.0, jobsCompleted: 18,  status: 'rejected',             kycStatus: 'rejected',  isAvailable: false, isOnline: false, createdAt: '2026-07-15T08:00:00.000Z', earnings: { today: 0,   thisMonth: 0,     total: 1200 } },
  ];

  const _bookings = [
    { id: 'b001', service: 'Electrical Repair',  customerName: 'Ravi Mehta',    workerName: 'Rajesh Kumar',  status: 5, amount: 850,  createdAt: '2026-09-05T10:00:00.000Z', area: 'Karol Bagh'    },
    { id: 'b002', service: 'Pipe Fixing',         customerName: 'Neha Joshi',    workerName: 'Suresh Yadav',  status: 5, amount: 600,  createdAt: '2026-09-05T11:30:00.000Z', area: 'Lajpat Nagar'  },
    { id: 'b003', service: 'Deep Cleaning',       customerName: 'Arjun Nair',    workerName: 'Anita Sharma',  status: 3, amount: 1200, createdAt: '2026-09-06T08:00:00.000Z', area: 'Dwarka'        },
    { id: 'b004', service: 'Cabinet Installation',customerName: 'Sonia Rawat',   workerName: 'Mohan Lal',     status: 2, amount: 950,  createdAt: '2026-09-06T09:00:00.000Z', area: 'Rohini'        },
    { id: 'b005', service: 'Home Cleaning',       customerName: 'Kiran Bhat',    workerName: 'Priya Singh',   status: 4, amount: 700,  createdAt: '2026-09-06T10:15:00.000Z', area: 'Saket'         },
    { id: 'b006', service: 'Wiring Check',        customerName: 'Tanvir Ahmed',  workerName: null,            status: 1, amount: 400,  createdAt: '2026-09-06T11:00:00.000Z', area: 'Vasant Kunj'   },
    { id: 'b007', service: 'Drain Cleaning',      customerName: 'Pooja Kapoor',  workerName: null,            status: 1, amount: 350,  createdAt: '2026-09-06T11:45:00.000Z', area: 'Pitampura'     },
    { id: 'b008', service: 'Furniture Repair',    customerName: 'Manish Saxena', workerName: 'Mohan Lal',     status: 5, amount: 500,  createdAt: '2026-09-04T16:00:00.000Z', area: 'Mayur Vihar'   },
  ];

  const _assessments = [
    { id: 'a001', workerId: 'w006', workerName: 'Vikram Tiwari', trade: 'driver',      token: 'TOK-A1', assignedAt: '2026-09-04T09:00:00.000Z', status: 'assigned', result: null, score: null },
    { id: 'a002', workerId: 'w007', workerName: 'Geeta Devi',    trade: 'cleaner',     token: 'TOK-A2', assignedAt: '2026-09-04T10:00:00.000Z', status: 'pending',  result: null, score: null },
    { id: 'a003', workerId: 'w008', workerName: 'Amit Verma',    trade: 'electrician', token: 'TOK-A3', assignedAt: '2026-09-05T08:00:00.000Z', status: 'pending',  result: null, score: null },
    { id: 'a004', workerId: 'w009', workerName: 'Sunita Mishra', trade: 'plumber',     token: 'TOK-A4', assignedAt: '2026-09-05T09:30:00.000Z', status: 'pending',  result: null, score: null },
    { id: 'a005', workerId: 'w010', workerName: 'Deepak Gupta',  trade: 'carpenter',   token: 'TOK-A5', assignedAt: '2026-08-20T11:00:00.000Z', status: 'completed', result: 'fail', score: 32 },
  ];

  const _complaints = [
    { id: 'c001', customerName: 'Ravi Mehta',   workerName: 'Suresh Yadav', subject: 'Work not completed properly', status: 'open',     createdAt: '2026-09-05T14:00:00.000Z' },
    { id: 'c002', customerName: 'Pooja Kapoor', workerName: 'Mohan Lal',    subject: 'Late arrival',                 status: 'resolved', createdAt: '2026-09-04T10:00:00.000Z' },
    { id: 'c003', customerName: 'Tanvir Ahmed', workerName: null,           subject: 'No worker assigned for 2 hrs', status: 'open',     createdAt: '2026-09-06T12:00:00.000Z' },
  ];

  // noop unsubscribe
  const _noop = () => {};

  // ── Auth ──────────────────────────────────────────────────────
  window.UniServAuth = {
    login:        (_email, _pass) => Promise.resolve({ user: { uid: 'sim-organizer', email: 'admin@demo.com' } }),
    logout:       ()              => Promise.resolve(),
    onAuthChange: (cb)            => { setTimeout(() => cb({ uid: 'sim-organizer', email: 'admin@demo.com' }), 0); return _noop; },
  };

  // ── Workers ───────────────────────────────────────────────────
  window.UniServWorkers = {
    subscribeAll: (cb) => {
      setTimeout(() => cb([..._workers]), 0);
      return _noop;
    },
    subscribePending: (cb) => {
      setTimeout(() => cb(_workers.filter(w => w.kycStatus === 'pending')), 0);
      return _noop;
    },
    approveKyc: (workerId) => {
      const w = _workers.find(w => w.id === workerId);
      if (w) { w.kycStatus = 'verified'; w.status = 'active'; w.isAvailable = true; }
      return Promise.resolve();
    },
    rejectKyc: (workerId, reason) => {
      const w = _workers.find(w => w.id === workerId);
      if (w) { w.kycStatus = 'rejected'; w.status = 'rejected'; w.rejectReason = reason || 'KYC documents incomplete'; }
      return Promise.resolve();
    },
    update: (workerId, data) => {
      const idx = _workers.findIndex(w => w.id === workerId);
      if (idx !== -1) Object.assign(_workers[idx], data);
      return Promise.resolve();
    },
  };

  // ── Assessments ───────────────────────────────────────────────
  window.UniServAssessments = {
    subscribeAll: (cb) => {
      setTimeout(() => cb([..._assessments]), 0);
      return _noop;
    },
    assignToken: (workerId, workerName, trade) => {
      const token = 'ASS-' + Math.floor(1000 + Math.random() * 9000);
      const entry = {
        id: 'a' + Date.now(), workerId, workerName, trade,
        token, status: 'assigned', result: null, score: null,
        createdAt: new Date().toISOString(),
      };
      _assessments.unshift(entry);
      const w = _workers.find(w => w.id === workerId);
      if (w) { w.assessmentToken = token; w.assessmentStatus = 'assigned'; }
      return Promise.resolve(token);
    },
    scheduleAssessment: (assessmentId, dateTime, assessor) => {
      const a = _assessments.find(a => a.id === assessmentId);
      if (a) { a.status = 'scheduled'; a.scheduledDate = dateTime; a.assessor = assessor; }
      return Promise.resolve();
    },
    recordResult: (assessmentId, workerId, result, score) => {
      const a = _assessments.find(a => a.id === assessmentId);
      if (a) { a.status = 'completed'; a.result = result; a.score = score; a.completedAt = new Date().toISOString(); }
      const w = _workers.find(w => w.id === workerId);
      if (w) {
        w.assessmentStatus = result === 'pass' ? 'passed' : 'failed';
        w.status = result === 'pass' ? 'active' : 'rejected';
        w.isAvailable = result === 'pass';
      }
      return Promise.resolve();
    },
  };

  // ── Bookings ──────────────────────────────────────────────────
  window.UniServBookings = {
    subscribeAll: (cb) => {
      setTimeout(() => cb([..._bookings]), 0);
      return _noop;
    },
    subscribeLive: (cb) => {
      setTimeout(() => cb(_bookings.filter(b => b.status >= 1 && b.status <= 4)), 0);
      return _noop;
    },
  };

  // ── Complaints ────────────────────────────────────────────────
  window.UniServComplaints = {
    subscribeAll: (cb) => {
      setTimeout(() => cb([..._complaints]), 0);
      return _noop;
    },
    updateStatus: (complaintId, status) => {
      const c = _complaints.find(c => c.id === complaintId);
      if (c) c.status = status;
      return Promise.resolve();
    },
  };

  // ── Analytics ─────────────────────────────────────────────────
  window.UniServAnalytics = {
    get: () => Promise.resolve({
      totalWorkers:      10,
      activeWorkers:     6,
      pendingKyc:        4,
      totalBookings:     8,
      completedBookings: 5,
      revenue:           24800,
      avgRating:         4.4,
    }),
  };

  // ── Seed (no-op in sim mode) ──────────────────────────────────
  window.UniServSeed = {
    seedWorkersFromJson: (_workersArray) => Promise.resolve(),
  };

  console.log('[UniServ] Demo mode active.');

} else {
  // ── Live Firebase mode ────────────────────────────────────────
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

  // ── Analytics (live — computed from Firestore in a real impl) ─
  window.UniServAnalytics = {
    get: () => Promise.resolve({
      totalWorkers: 0, activeWorkers: 0, pendingKyc: 0,
      totalBookings: 0, completedBookings: 0, revenue: 0, avgRating: 0,
    }),
  };

  console.log('[UniServ] Firebase data layer initialized.');
}
