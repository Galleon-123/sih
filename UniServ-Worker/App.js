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

export default function App() {
  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <WorkerProvider>
          <JobProvider>
            <View style={{ flex: 1 }}>
              <WebAppBar />
              <NavigationContainer>
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
