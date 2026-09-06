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

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(DEFAULT_USER);
  const [language, setLanguageState] = useState(DEFAULT_LANGUAGE);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Translation helper reactive to active language code
  const t = (key) => {
    return getTranslation(language?.code || 'en', key);
  };

  // Load saved user state on launch
  useEffect(() => {
    const loadStoredData = async () => {
      try {
        const storedLang = await AsyncStorage.getItem('@uniserv_language');
        if (storedLang) {
          setLanguageState(JSON.parse(storedLang));
        }
        const storedUser = await AsyncStorage.getItem('@uniserv_user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
        const storedAuth = await AsyncStorage.getItem('@uniserv_is_logged_in');
        if (storedAuth === 'true') {
          setIsLoggedIn(true);
        }
      } catch (e) {
        console.error('Error loading stored user preferences:', e);
      } finally {
        setIsLoading(false);
      }
    };
    loadStoredData();
  }, []);

  const setLanguage = async (newLanguage) => {
    setLanguageState(newLanguage);
    try {
      await AsyncStorage.setItem('@uniserv_language', JSON.stringify(newLanguage));
    } catch (e) {
      console.error('Error saving language:', e);
    }
  };

  const login = async (phone) => {
    const updatedUser = { ...user, phone: phone || user.phone };
    setUser(updatedUser);
    setIsLoggedIn(true);
    try {
      await AsyncStorage.setItem('@uniserv_user', JSON.stringify(updatedUser));
      await AsyncStorage.setItem('@uniserv_is_logged_in', 'true');
    } catch (e) {
      console.error('Error persisting login session:', e);
    }
  };

  const registerUser = async (profileData) => {
    const updatedUser = {
      ...user,
      ...profileData,
      isRegistered: true
    };
    setUser(updatedUser);
    setIsLoggedIn(true);
    try {
      await AsyncStorage.setItem('@uniserv_user', JSON.stringify(updatedUser));
      await AsyncStorage.setItem('@uniserv_is_logged_in', 'true');
    } catch (e) {
      console.error('Error persisting registered user:', e);
    }
    return updatedUser;
  };

  const logout = async () => {
    setIsLoggedIn(false);
    try {
      await AsyncStorage.removeItem('@uniserv_is_logged_in');
    } catch (e) {
      console.error('Error clearing session:', e);
    }
  };

  const updateUserProfile = async (updates) => {
    const updated = { ...user, ...updates };
    setUser(updated);
    try {
      await AsyncStorage.setItem('@uniserv_user', JSON.stringify(updated));
    } catch (e) {
      console.error('Error saving profile updates:', e);
    }
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
        t
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
export default UserContext;
