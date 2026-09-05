import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { WorkerProvider } from './src/context/WorkerContext';
import { JobProvider } from './src/context/JobContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <WorkerProvider>
        <JobProvider>
          <NavigationContainer>
            <StatusBar style="dark" backgroundColor="#FFFFFF" />
            <AppNavigator />
          </NavigationContainer>
        </JobProvider>
      </WorkerProvider>
    </SafeAreaProvider>
  );
}
