import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getTranslation } from '../i18n/translations';

const UserContext = createContext();

const DEFAULT_USER = {
  name: 'Priya Sharma',
  phone: '9876543210',
  email: 'priya.sharma@example.com',
  address: 'Flat 302, Palm Heights, Block B, Lajpat Nagar',
  landmark: 'Near Metro Gate No. 2',
  city: 'New Delhi',
  pincode: '110024',
  addressTag: 'Home',
  cooperativeTier: 'Silver Member',
  isRegistered: true
};

const DEFAULT_LANGUAGE = {
  code: 'en',
  name: 'English',
  nativeName: 'English'
};

// Memory fallback store for environments where AsyncStorage is blocked (e.g. Safari private browsing)
const memoryStorage = {};

const safeGetItem = async (key) => {
  try {
    const val = await AsyncStorage.getItem(key);
    return val !== null ? val : memoryStorage[key] || null;
  } catch (e) {
    console.warn(`AsyncStorage.getItem failed for ${key}, falling back to memory:`, e);
    return memoryStorage[key] || null;
  }
};

const safeSetItem = async (key, val) => {
  memoryStorage[key] = val;
  try {
    await AsyncStorage.setItem(key, val);
  } catch (e) {
    console.warn(`AsyncStorage.setItem failed for ${key}, saved in memory:`, e);
  }
};

const safeRemoveItem = async (key) => {
  delete memoryStorage[key];
  try {
    await AsyncStorage.removeItem(key);
  } catch (e) {
    console.warn(`AsyncStorage.removeItem failed for ${key}:`, e);
  }
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(DEFAULT_USER);
  const [language, setLanguageState] = useState(DEFAULT_LANGUAGE);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [bootstrapStage, setBootstrapStage] = useState('Initializing Services...');

  // Translation helper reactive to active language code
  const t = (key) => {
    return getTranslation(language?.code || 'en', key);
  };

  // Robust launch initialization with timeout safety
  useEffect(() => {
    let isMounted = true;

    // Safety timeout: Never hang bootstrap on any device longer than 1200ms
    const timeout = setTimeout(() => {
      if (isMounted && isLoading) {
        setIsLoading(false);
      }
    }, 1200);

    const loadStoredData = async () => {
      try {
        setBootstrapStage('Connecting Cooperative Registry...');
        const storedLang = await safeGetItem('@uniserv_language');
        if (storedLang && isMounted) {
          try {
            setLanguageState(JSON.parse(storedLang));
          } catch (err) {
            console.warn('Failed parsing stored language:', err);
          }
        }

        setBootstrapStage('Loading Verified Citizen Session...');
        const storedUser = await safeGetItem('@uniserv_user');
        if (storedUser && isMounted) {
          try {
            setUser(JSON.parse(storedUser));
          } catch (err) {
            console.warn('Failed parsing stored user:', err);
          }
        }

        const storedAuth = await safeGetItem('@uniserv_is_logged_in');
        if (storedAuth === 'true' && isMounted) {
          setIsLoggedIn(true);
        }
      } catch (e) {
        console.error('Error in UniServ bootstrap loader:', e);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadStoredData();

    return () => {
      isMounted = false;
      clearTimeout(timeout);
    };
  }, []);

  const setLanguage = async (newLanguage) => {
    setLanguageState(newLanguage);
    await safeSetItem('@uniserv_language', JSON.stringify(newLanguage));
  };

  const login = async (phone) => {
    const updatedUser = { ...user, phone: phone || user.phone };
    setUser(updatedUser);
    setIsLoggedIn(true);
    await safeSetItem('@uniserv_user', JSON.stringify(updatedUser));
    await safeSetItem('@uniserv_is_logged_in', 'true');
  };

  const registerUser = async (profileData) => {
    const updatedUser = {
      ...user,
      ...profileData,
      isRegistered: true
    };
    setUser(updatedUser);
    setIsLoggedIn(true);
    await safeSetItem('@uniserv_user', JSON.stringify(updatedUser));
    await safeSetItem('@uniserv_is_logged_in', 'true');
    return updatedUser;
  };

  const logout = async () => {
    setIsLoggedIn(false);
    await safeRemoveItem('@uniserv_is_logged_in');
  };

  const updateUserProfile = async (updates) => {
    const updated = { ...user, ...updates };
    setUser(updated);
    await safeSetItem('@uniserv_user', JSON.stringify(updated));
  };

  return (
    <UserContext.Provider
      value={{
        user,
        language,
        setLanguage,
        isLoggedIn,
        login,
        registerUser,
        logout,
        updateUserProfile,
        isLoading,
        bootstrapStage,
        setIsLoading,
        t
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
export default UserContext;
