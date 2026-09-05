import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  onAuthStateChanged, signOut,
  signInWithPhoneNumber, PhoneAuthProvider, signInWithCredential,
} from 'firebase/auth';
import { doc, getDoc, setDoc, collection, query, where, limit, getDocs, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase/firebase';
import { getTranslation } from '../i18n/translations';

const UserContext = createContext();
const DEFAULT_LANGUAGE = { code: 'en', name: 'English', nativeName: 'English' };

export const UserProvider = ({ children }) => {
  const [user, setUser]              = useState(null);
  const [language, setLanguageState] = useState(DEFAULT_LANGUAGE);
  const [isLoggedIn, setIsLoggedIn]  = useState(false);
  const [isLoading, setIsLoading]    = useState(true);
  const [permissions, setPermissions] = useState({
    location: false, camera: false, microphone: false,
    media: false, hasRequestedFirstTime: false,
  });

  const t = (key, fallback) => {
    const val = getTranslation(language?.code || 'en', key, fallback);
    return (val !== undefined && val !== null && val !== '') ? val : (fallback ?? '');
  };

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const storedLang = await AsyncStorage.getItem('@uniserv_language');
        if (storedLang) setLanguageState(JSON.parse(storedLang));
        const storedPerms = await AsyncStorage.getItem('@uniserv_permissions');
        if (storedPerms) setPermissions(JSON.parse(storedPerms));
      } catch (_) {}
    };
    bootstrap();
  }, []);

  // ── Firebase Auth observer ───────────────────────────────────
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const profile = await _loadOrCreateProfile(firebaseUser.uid, firebaseUser.phoneNumber);
        setUser(profile);
        setIsLoggedIn(true);
      } else {
        setUser(null);
        setIsLoggedIn(false);
      }
      setIsLoading(false);
    });
    return unsub;
  }, []);

  const _loadOrCreateProfile = async (uid, phoneNumber) => {
    const ref = doc(db, 'users', uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      const phone = (phoneNumber || '').replace('+91', '').replace('+', '');
      const newProfile = {
        uid, phone,
        name: '', email: '', address: '',
        locality: '', city: '', district: '', state: '', pincode: '',
        landmark: '', house: '', addressTag: 'Home',
        cooperativeTier: 'Silver Member',
        isRegistered: false,
        createdAt: serverTimestamp(),
      };
      await setDoc(ref, newProfile);
      return newProfile;
    }
    return snap.data();
  };

  const checkUserExists = async (phone) => {
    const clean = phone.replace(/[^0-9]/g, '');
    const q = query(
      collection(db, 'users'),
      where('phone', '==', clean),
      where('isRegistered', '==', true),
      limit(1)
    );
    const snap = await getDocs(q);
    return !snap.empty;
  };

  const login = async (uid, phone) => _loadOrCreateProfile(uid, phone);

  const registerUser = async (profileData) => {
    const uid = auth.currentUser?.uid;
    if (!uid) throw new Error('Not authenticated');
    const updated = { ...user, ...profileData, isRegistered: true, updatedAt: serverTimestamp() };
    await setDoc(doc(db, 'users', uid), updated, { merge: true });
    setUser(updated);
    return updated;
  };

  const updateUserProfile = async (updates) => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    const updated = { ...user, ...updates, updatedAt: serverTimestamp() };
    await setDoc(doc(db, 'users', uid), updated, { merge: true });
    setUser(updated);
  };

  const registerAnotherUser = async (citizenData) => {
    const clean = (citizenData.phone || '').replace(/[^0-9]/g, '');
    if (!clean || clean.length < 10) return { success: false, error: 'Valid 10-digit number required' };
    const newCitizen = {
      phone: clean, name: citizenData.name || 'Citizen',
      email: citizenData.email || `${clean}@esevai.uniserv.gov.in`,
      address: citizenData.address || '', locality: citizenData.locality || '',
      city: citizenData.city || '', state: citizenData.state || '',
      cooperativeTier: 'Standard Member',
      registeredByHelper: user?.phone || 'E-Sevai',
      registrationSource: 'E-Sevai / Neighbour Assisted Portal',
      isRegistered: true,
      createdAt: serverTimestamp(),
    };
    await setDoc(doc(db, 'users', `phone_${clean}`), newCitizen, { merge: true });
    return { success: true, citizen: newCitizen };
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setIsLoggedIn(false);
  };

  const setLanguage = async (newLanguage) => {
    setLanguageState(newLanguage);
    await AsyncStorage.setItem('@uniserv_language', JSON.stringify(newLanguage)).catch(() => {});
  };

  const grantAllPermissions = async () => {
    const updated = { location: true, camera: true, microphone: true, media: true, hasRequestedFirstTime: true };
    setPermissions(updated);
    await AsyncStorage.setItem('@uniserv_permissions', JSON.stringify(updated));
    return updated;
  };

  const updatePermission = async (key, val) => {
    const updated = { ...permissions, [key]: val, hasRequestedFirstTime: true };
    setPermissions(updated);
    await AsyncStorage.setItem('@uniserv_permissions', JSON.stringify(updated));
    return updated;
  };

  // getUserByPhone kept for compatibility (reads from Firestore)
  const getUserByPhone = async (phone) => {
    const clean = phone.replace(/[^0-9]/g, '');
    const q = query(collection(db, 'users'), where('phone', '==', clean), limit(1));
    const snap = await getDocs(q);
    return snap.empty ? null : snap.docs[0].data();
  };

  return (
    <UserContext.Provider value={{
      user, language, setLanguage, isLoggedIn, isLoading,
      login, registerUser, registerAnotherUser, checkUserExists, getUserByPhone,
      logout, updateUserProfile,
      permissions, grantAllPermissions, updatePermission,
      t,
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
export default UserContext;
