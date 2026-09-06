import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useUser } from '../context/UserContext';

// Screens
import Screen01_LanguageSelection from '../screens/Screen01_LanguageSelection';
import Screen02_OTPLogin from '../screens/Screen02_OTPLogin';
import Screen02_Registration from '../screens/Screen02_Registration';
import BottomTabNavigator from './BottomTabNavigator';
import Screen04_ServiceDetail from '../screens/Screen04_ServiceDetail';
import Screen05_BookingForm from '../screens/Screen05_BookingForm';
import Screen06_WorkerMatch from '../screens/Screen06_WorkerMatch';
import Screen07_LiveTracking from '../screens/Screen07_LiveTracking';
import Screen08_StartOTP from '../screens/Screen08_StartOTP';
import Screen09_JobInProgress from '../screens/Screen09_JobInProgress';
import Screen10_ExtraWorkApproval from '../screens/Screen10_ExtraWorkApproval';
import Screen11_CompletionOTP from '../screens/Screen11_CompletionOTP';
import Screen12_PaymentScreen from '../screens/Screen12_PaymentScreen';
import Screen12_BulkPaymentScreen from '../screens/Screen12_BulkPaymentScreen';
import Screen13_PaymentSuccess from '../screens/Screen13_PaymentSuccess';
import Screen13_BulkProjectSuccess from '../screens/Screen13_BulkProjectSuccess';
import Screen14_RatingScreen from '../screens/Screen14_RatingScreen';
import Screen15_NoWorkerAvailable from '../screens/Screen15_NoWorkerAvailable';
import Screen16_ComplaintScreen from '../screens/Screen16_ComplaintScreen';
import Screen17_SevaSurakshaScreen from '../screens/Screen17_SevaSurakshaScreen';
import Screen18_CommunityScreen from '../screens/Screen18_CommunityScreen';

const Stack = createNativeStackNavigator();

export const AppNavigator = () => {
  const { isLoggedIn, isLoading } = useUser();

  return (
    <Stack.Navigator
      initialRouteName={isLoggedIn ? 'MainTabs' : 'LanguageSelection'}
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right'
      }}
    >
      {/* Auth & Onboarding Flow */}
      <Stack.Screen name="LanguageSelection" component={Screen01_LanguageSelection} />
      <Stack.Screen name="OTPLogin" component={Screen02_OTPLogin} />
      <Stack.Screen name="Registration" component={Screen02_Registration} />

      {/* Main Tabbed App */}
      <Stack.Screen name="MainTabs" component={BottomTabNavigator} />
      <Stack.Screen name="Home" component={BottomTabNavigator} />

      {/* Community & Society Bulk Hub */}
      <Stack.Screen name="Community" component={Screen18_CommunityScreen} />

      {/* Service Request & Matching Flow */}
      <Stack.Screen name="ServiceDetail" component={Screen04_ServiceDetail} />
      <Stack.Screen name="BookingForm" component={Screen05_BookingForm} />
      <Stack.Screen name="WorkerMatch" component={Screen06_WorkerMatch} />
      <Stack.Screen name="NoWorkerAvailable" component={Screen15_NoWorkerAvailable} />

      {/* Live Tracking & Execution Flow */}
      <Stack.Screen name="LiveTracking" component={Screen07_LiveTracking} />
      <Stack.Screen name="StartOTP" component={Screen08_StartOTP} />
      <Stack.Screen name="JobInProgress" component={Screen09_JobInProgress} />
      <Stack.Screen name="ExtraWorkApproval" component={Screen10_ExtraWorkApproval} />
      <Stack.Screen name="CompletionOTP" component={Screen11_CompletionOTP} />

      {/* Payment & Settlement Flow */}
      <Stack.Screen name="Payment" component={Screen12_PaymentScreen} />
      <Stack.Screen name="BulkPayment" component={Screen12_BulkPaymentScreen} />
      <Stack.Screen name="PaymentSuccess" component={Screen13_PaymentSuccess} />
      <Stack.Screen name="BulkProjectSuccess" component={Screen13_BulkProjectSuccess} />
      <Stack.Screen name="RatingScreen" component={Screen14_RatingScreen} />

      {/* Seva Suraksha & Grievance Modals */}
      <Stack.Screen
        name="Complaint"
        component={Screen16_ComplaintScreen}
        options={{ animation: 'slide_from_bottom' }}
      />
      <Stack.Screen
        name="SevaSuraksha"
        component={Screen17_SevaSurakshaScreen}
        options={{ animation: 'slide_from_bottom' }}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;
