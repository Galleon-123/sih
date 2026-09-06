import React from 'react';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { UserProvider } from './src/context/UserContext';
import { BookingProvider } from './src/context/BookingContext';
import AppNavigator from './src/navigation/AppNavigator';
import WebAppBar from './src/components/WebAppBar';

export default function App() {
  return (
    <SafeAreaProvider>
      <UserProvider>
        <BookingProvider>
          <View style={{ flex: 1 }}>
            <WebAppBar />
            <NavigationContainer>
              <StatusBar style="dark" backgroundColor="#FFFFFF" />
              <AppNavigator />
            </NavigationContainer>
          </View>
        </BookingProvider>
      </UserProvider>
    </SafeAreaProvider>
  );
}
