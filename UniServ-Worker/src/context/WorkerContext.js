import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../firebase/firebase';
import { getTranslation } from '../i18n/translations';

// Safe In-Memory Storage Fallback
const memoryStorage = new Map();
const safeStorage = {
  getItem: async (key) => {
    try {
      const val = await AsyncStorage.getItem(key);
      if (val !== null) return val;
      return memoryStorage.get(key) || null;
    } catch (e) {
      return memoryStorage.get(key) || null;
    }
  },
  setItem: async (key, val) => {
    try {
      memoryStorage.set(key, val);
      await AsyncStorage.setItem(key, val);
    } catch (e) {
      memoryStorage.set(key, val);
    }
  },
  multiRemove: async (keys) => {
    try {
      keys.forEach((k) => memoryStorage.delete(k));
      await AsyncStorage.multiRemove(keys);
    } catch (e) {
      keys.forEach((k) => memoryStorage.delete(k));
    }
  }
};

const WorkerContext = createContext();

// ── Simulation / Demo mode default profile ────────────────────────────────────
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
  const [worker, setWorker]                     = useState(null);
  const [language, setLanguageState]            = useState('en');
  const [isLoggedIn, setIsLoggedIn]             = useState(false);
  const [isLoading, setIsLoading]               = useState(true);
  const [registrationStep, setRegistrationStep] = useState('language');

  const simModeRef = useRef(false);

  const t = (key, fallback) => {
    const activeLang = language || worker?.language || 'en';
    const val = getTranslation(activeLang, key, fallback);
    return (val !== undefined && val !== null && val !== '') ? val : (fallback ?? '');
  };

  // 1. Initial Storage Bootstrap & Web Page Title
  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      document.title = 'UniServ Worker - Cooperative Artisan Platform';
    }

    let isMounted = true;

    const bootstrapStorage = async () => {
      try {
        const [storedLang, storedProfile] = await Promise.all([
          safeStorage.getItem('@worker_language'),
          safeStorage.getItem('@worker_profile')
        ]);

        if (!isMounted) return;

        if (storedLang) {
          setLanguageState(storedLang);
        }

        if (storedProfile) {
          try {
            const parsed = JSON.parse(storedProfile);
            if (parsed && typeof parsed === 'object') {
              simModeRef.current = true;
              setWorker(parsed);
              setIsLoggedIn(true);
              setRegistrationStep(parsed.registrationStep || 'completed');
            }
          } catch (e) {}
        }
      } catch (err) {
        console.warn('Bootstrap storage error:', err);
      }
    };

    bootstrapStorage();

    // Absolute safety timeout: Guarantee bootstrap resolves within 600ms
    const safetyTimer = setTimeout(() => {
      if (isMounted) {
        setIsLoading(false);
      }
    }, 600);

    return () => {
      isMounted = false;
      clearTimeout(safetyTimer);
    };
  }, []);

  // 2. Auth Observer with Error Fallback
  useEffect(() => {
    let unsub = () => {};
    try {
      unsub = onAuthStateChanged(auth, async (firebaseUser) => {
        try {
          if (simModeRef.current) {
            setIsLoading(false);
            return;
          }
          if (firebaseUser) {
            const profile = await _loadOrCreate(firebaseUser.uid, firebaseUser.phoneNumber);
            setWorker(profile);
            if (profile?.language) {
              setLanguageState(profile.language);
              safeStorage.setItem('@worker_language', profile.language).catch(() => {});
            }
            setIsLoggedIn(true);
            if (profile?.registrationStep) setRegistrationStep(profile.registrationStep);
          } else {
            if (!simModeRef.current) {
              setWorker(null);
              setIsLoggedIn(false);
            }
          }
        } catch (e) {
          console.warn('Auth state handler error:', e);
        } finally {
          setIsLoading(false);
        }
      });
    } catch (e) {
      console.warn('Firebase auth listener failed:', e);
      setIsLoading(false);
    }
    return unsub;
  }, []);

  // 3. Live profile updates (when authenticated)
  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    try {
      const unsub = onSnapshot(doc(db, 'workers', uid), (snap) => {
        if (snap.exists()) setWorker(snap.data());
      });
      return unsub;
    } catch (e) {}
  }, [isLoggedIn]);

  const _loadOrCreate = async (uid, phoneNumber) => {
    try {
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
    } catch (e) {
      console.warn('Failed _loadOrCreate:', e);
      return { ...SIM_WORKER, uid, phone: phoneNumber || '9811223344' };
    }
  };

  const login = async (uid, phone) => _loadOrCreate(uid, phone);

  const updateWorker = async (fields) => {
    const uid = auth.currentUser?.uid;
    if (fields.language) {
      setLanguageState(fields.language);
      safeStorage.setItem('@worker_language', fields.language).catch(() => {});
    }
    setWorker((prev) => {
      const updated = { ...(prev || SIM_WORKER), ...fields };
      if (simModeRef.current) {
        safeStorage.setItem('@worker_profile', JSON.stringify(updated)).catch(() => {});
      }
      return updated;
    });

    if (!uid) return;
    try {
      await setDoc(doc(db, 'workers', uid), { ...fields, updatedAt: serverTimestamp() }, { merge: true });
    } catch (e) {
      console.warn('Worker update failed:', e);
    }
  };

  const setLanguage = async (newLang) => {
    const code = typeof newLang === 'object' ? newLang?.code : (newLang || 'en');
    setLanguageState(code);
    await safeStorage.setItem('@worker_language', code).catch(() => {});
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

  const toggleOnline = () => {
    setWorker((prev) => {
      const currentOnline = prev?.isOnline || false;
      const nextOnline = !currentOnline;
      const updated = { ...(prev || SIM_WORKER), isOnline: nextOnline, isAvailable: nextOnline };
      if (simModeRef.current) {
        safeStorage.setItem('@worker_profile', JSON.stringify(updated)).catch(() => {});
      }
      return updated;
    });
  };

  const logout = async () => {
    simModeRef.current = false;
    await signOut(auth).catch(() => {});
    setWorker(null);
    setIsLoggedIn(false);
    setRegistrationStep('language');
    setLanguageState('en');
    await safeStorage.multiRemove(['@worker_language', '@worker_profile']).catch(() => {});
  };

  const getAssessmentToken = () => worker?.assessmentToken || null;

  // ── Demo / simulation login — fast & offline-capable ───────────────
  const loginAsDemo = (overrideLang) => {
    simModeRef.current = true;
    const activeLang = overrideLang || language || 'en';
    setLanguageState(activeLang);
    safeStorage.setItem('@worker_language', activeLang).catch(() => {});
    const demoProfile = { ...SIM_WORKER, language: activeLang };
    setWorker(demoProfile);
    safeStorage.setItem('@worker_profile', JSON.stringify(demoProfile)).catch(() => {});
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
