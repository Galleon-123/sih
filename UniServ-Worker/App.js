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
    'http://localhost:8081/worker',
    'https://galleon-123.github.io/sih/worker',
    'https://galleon-123.github.io',
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
        path: '',
        screens: {
          Home: { path: 'Home', alias: ['MainTabs/Home'] },
          Jobs: { path: 'Jobs', alias: ['MainTabs/Jobs', 'jobs'] },
          Earnings: { path: 'Earnings', alias: ['MainTabs/Earnings', 'earnings'] },
          Schedule: { path: 'Schedule', alias: ['MainTabs/Schedule', 'schedule'] },
          Profile: { path: 'Profile', alias: ['MainTabs/Profile', 'profile'] },
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
