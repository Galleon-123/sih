import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../firebase/firebase';
import { getTranslation } from '../i18n/translations';

const WorkerContext = createContext();

// ── Simulation / Demo mode ────────────────────────────────────
const SIM_WORKER = {
  uid: 'demo-worker-001',
  phone: '9811223344',
  name: 'Ravi Kumar',
  trade: 'electrician',
  experience: '5 years',
  cooperative: 'Delhi Electrical Workers Co-op',
  kycStatus: 'verified',
  assessmentStatus: 'passed',
  assessmentToken: 'DEMO-TOK',
  isCertified: true,
  status: 'active',
  isAvailable: true,
  isOnline: false,
  verificationStatus: 'verified',
  rating: 4.7,
  jobsCompleted: 142,
  language: 'en',
  registrationStep: 'completed',
  earnings: { today: 450, thisMonth: 8200, total: 94500 },
  welfare: { thisMonth: 600, total: 7200 },
  insurance: { status: 'active', validUntil: '2027-03-31', policyNo: 'UWCI-2026-08871' },
  certificates: [],
  aadhaarNumber: '****-****-1234',
  aadhaarFront: null,
  aadhaarBack: null,
  selfie: null,
};

export const WorkerProvider = ({ children }) => {
  const [worker, setWorker]               = useState(null);
  const [language, setLanguageState]      = useState('en');
  const [isLoggedIn, setIsLoggedIn]       = useState(false);
  const [isLoading, setIsLoading]         = useState(true);
  const [registrationStep, setRegistrationStep] = useState('language');

  const t = (key, fallback) => {
    const activeLang = language || worker?.language || 'en';
    const val = getTranslation(activeLang, key, fallback);
    return (val !== undefined && val !== null && val !== '') ? val : (fallback ?? '');
  };

  useEffect(() => {
    AsyncStorage.getItem('@worker_language')
      .then((l) => {
        if (l) {
          setLanguageState(l);
          setWorker((prev) => (prev ? { ...prev, language: l } : prev));
        }
      })
      .catch(() => {});
  }, []);

  // ── Auth observer ────────────────────────────────────────────
  const simModeRef = React.useRef(false);
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (simModeRef.current) return; // sim mode active — ignore Firebase
      if (firebaseUser) {
        const profile = await _loadOrCreate(firebaseUser.uid, firebaseUser.phoneNumber);
        setWorker(profile);
        if (profile?.language) {
          setLanguageState(profile.language);
          AsyncStorage.setItem('@worker_language', profile.language).catch(() => {});
        }
        setIsLoggedIn(true);
        if (profile?.registrationStep) setRegistrationStep(profile.registrationStep);
      } else {
        setWorker(null);
        setIsLoggedIn(false);
      }
      setIsLoading(false);
    });
    return unsub;
  }, []);

  // ── Live profile updates (organizer assigns assessment token) ─
  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    const unsub = onSnapshot(doc(db, 'workers', uid), (snap) => {
      if (snap.exists()) setWorker(snap.data());
    });
    return unsub;
  }, [isLoggedIn]);

  const _loadOrCreate = async (uid, phoneNumber) => {
    const ref = doc(db, 'workers', uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      const phone = (phoneNumber || '').replace('+91', '').replace('+', '');
      const newProfile = {
        uid, phone,
        name: '', trade: '', experience: '', cooperative: '',
        kycStatus: 'pending', assessmentStatus: 'unassigned',
        assessmentToken: null, isCertified: false,
        status: 'pending_verification', isAvailable: false, isOnline: false,
        rating: 0, jobsCompleted: 0, language: language || 'en',
        registrationStep: 'nameEntry',
        earnings: { today: 0, thisMonth: 0, total: 0 },
        welfare: { thisMonth: 0, total: 0 },
        insurance: { status: 'pending', validUntil: '', policyNo: '' },
        certificates: [], aadhaarNumber: '',
        aadhaarFront: null, aadhaarBack: null, selfie: null,
        createdAt: serverTimestamp(),
      };
      await setDoc(ref, newProfile);
      return newProfile;
    }
    return snap.data();
  };

  const login = async (uid, phone) => _loadOrCreate(uid, phone);

  const updateWorker = async (fields) => {
    const uid = auth.currentUser?.uid;
    if (fields.language) {
      setLanguageState(fields.language);
      AsyncStorage.setItem('@worker_language', fields.language).catch(() => {});
    }
    setWorker((prev) => ({ ...prev, ...fields }));
    if (!uid) return;
    await setDoc(doc(db, 'workers', uid), { ...fields, updatedAt: serverTimestamp() }, { merge: true })
      .catch((e) => console.warn('Worker update failed:', e));
  };

  const setLanguage = async (newLang) => {
    const code = typeof newLang === 'object' ? newLang?.code : (newLang || 'en');
    setLanguageState(code);
    AsyncStorage.setItem('@worker_language', code).catch(() => {});
    setWorker((prev) => (prev ? { ...prev, language: code } : prev));
    const uid = auth.currentUser?.uid;
    if (uid) {
      await setDoc(doc(db, 'workers', uid), { language: code, updatedAt: serverTimestamp() }, { merge: true })
        .catch((e) => console.warn('Worker update failed:', e));
    }
  };

  const setStep = (step) => {
    setRegistrationStep(step);
    updateWorker({ registrationStep: step });
  };

  const toggleOnline = () => updateWorker({ isOnline: !worker?.isOnline, isAvailable: !worker?.isOnline });

  const logout = async () => {
    await signOut(auth);
    setWorker(null);
    setIsLoggedIn(false);
    setRegistrationStep('language');
    setLanguageState('en');
    AsyncStorage.removeItem('@worker_language').catch(() => {});
  };

  const getAssessmentToken = () => worker?.assessmentToken || null;

  // ── Demo / simulation login — no Firebase calls ───────────────
  const loginAsDemo = (overrideLang) => {
    simModeRef.current = true;
    const activeLang = overrideLang || language || 'en';
    setLanguageState(activeLang);
    AsyncStorage.setItem('@worker_language', activeLang).catch(() => {});
    setWorker({ ...SIM_WORKER, language: activeLang });
    setIsLoggedIn(true);
    setRegistrationStep('completed');
    setIsLoading(false);
  };

  return (
    <WorkerContext.Provider value={{
      worker, language, t, setLanguage,
      isLoggedIn, isLoading, registrationStep,
      login, updateWorker, setStep, toggleOnline, logout,
      getAssessmentToken, loginAsDemo,
    }}>
      {children}
    </WorkerContext.Provider>
  );
};

export const useWorker = () => useContext(WorkerContext);
export default WorkerContext;
