import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useWorker } from '../context/WorkerContext';
import { colors } from '../theme/colors';

import Screen01_LanguageSelection from '../screens/Screen01_LanguageSelection';
import Screen02_MobileLogin from '../screens/Screen02_MobileLogin';
import Screen03_NameEntry from '../screens/Screen03_NameEntry';
import Screen04_eKYC from '../screens/Screen04_eKYC';
import Screen05_CertificationCheck from '../screens/Screen05_CertificationCheck';
import Screen05a_UploadCertificates from '../screens/Screen05a_UploadCertificates';
import Screen05b_AssessmentToken from '../screens/Screen05b_AssessmentToken';
import Screen06_PendingVerification from '../screens/Screen06_PendingVerification';
import Screen09_ActiveJob from '../screens/Screen09_ActiveJob';
import Screen_RatingScreen from '../screens/Screen_RatingScreen';
import Screen10_LiveTracking from '../screens/Screen10_LiveTracking';
import Screen12_WelfareFund from '../screens/Screen12_WelfareFund';
import Screen13_Insurance from '../screens/Screen13_Insurance';
import Screen15_DemandHeatmap from '../screens/Screen15_DemandHeatmap';
import SplashScreen from '../screens/SplashScreen';
import BottomTabNavigator from './BottomTabNavigator';

const Stack = createNativeStackNavigator();

export const AppNavigator = () => {
  const { isLoggedIn, isLoading, worker } = useWorker();
  const [showSplash, setShowSplash] = React.useState(true);

  if (isLoading && showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  const getInitialRoute = () => {
    if (!isLoggedIn || !worker) return 'LanguageSelection';
    if (worker?.verificationStatus !== 'verified') return 'PendingVerification';
    return 'MainTabs';
  };

  return (
    <Stack.Navigator
      initialRouteName={getInitialRoute()}
      screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
    >
      <Stack.Screen name="LanguageSelection" component={Screen01_LanguageSelection} />
      <Stack.Screen name="MobileLogin" component={Screen02_MobileLogin} />
      <Stack.Screen name="NameEntry" component={Screen03_NameEntry} />
      <Stack.Screen name="eKYC" component={Screen04_eKYC} />
      <Stack.Screen name="CertificationCheck" component={Screen05_CertificationCheck} />
      <Stack.Screen name="UploadCertificates" component={Screen05a_UploadCertificates} />
      <Stack.Screen name="AssessmentToken" component={Screen05b_AssessmentToken} />
      <Stack.Screen name="PendingVerification" component={Screen06_PendingVerification} />
      <Stack.Screen name="MainTabs" component={BottomTabNavigator} />
      <Stack.Screen name="ActiveJob" component={Screen09_ActiveJob} />
      <Stack.Screen name="RatingScreen" component={Screen_RatingScreen} />
      <Stack.Screen name="LiveTracking" component={Screen10_LiveTracking} />
      <Stack.Screen name="WelfareFund" component={Screen12_WelfareFund} />
      <Stack.Screen name="Insurance" component={Screen13_Insurance} />
      <Stack.Screen name="DemandHeatmap" component={Screen15_DemandHeatmap} />
    </Stack.Navigator>
  );
};

export default AppNavigator;
