import React from 'react';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { WorkerProvider } from './src/context/WorkerContext';
import { JobProvider } from './src/context/JobContext';
import AppNavigator from './src/navigation/AppNavigator';
import WebAppBar from './src/components/WebAppBar';
import ErrorBoundary from './src/components/ErrorBoundary';

const linking = {
  prefixes: [
    'http://localhost:8081',
    'https://galleon-123.github.io/sih/worker',
    'uniserv-worker://',
  ],
  config: {
    screens: {
      LanguageSelection: 'language',
      MobileLogin: 'login',
      NameEntry: 'register',
      eKYC: 'ekyc',
      CertificationCheck: 'certification',
      UploadCertificates: 'upload-certificates',
      AssessmentToken: 'assessment-token',
      PendingVerification: 'pending-verification',
      MainTabs: {
        path: 'MainTabs',
        screens: {
          Home: 'Home',
          Jobs: 'Jobs',
          Earnings: 'Earnings',
          Schedule: 'Schedule',
          Profile: 'Profile',
        },
      },
      ActiveJob: 'active-job',
      RatingScreen: 'rating',
      LiveTracking: 'tracking',
      WelfareFund: 'welfare',
      Insurance: 'insurance',
      DemandHeatmap: 'heatmap',
    },
  },
};

export default function App() {
  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <WorkerProvider>
          <JobProvider>
            <View style={{ flex: 1 }}>
              <WebAppBar />
              <NavigationContainer linking={linking}>
                <StatusBar style="dark" backgroundColor="#FFFFFF" />
                <AppNavigator />
              </NavigationContainer>
            </View>
          </JobProvider>
        </WorkerProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
