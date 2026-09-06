import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useWorker } from '../context/WorkerContext';
import Screen07_HomeDashboard from '../screens/Screen07_HomeDashboard';
import Screen08_JobRequest from '../screens/Screen08_JobRequest';
import Screen11_EarningsWallet from '../screens/Screen11_EarningsWallet';
import Screen14_Schedule from '../screens/Screen14_Schedule';
import Screen16_Profile from '../screens/Screen16_Profile';

const Tab = createBottomTabNavigator();

export const BottomTabNavigator = () => {
  const { t } = useWorker();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 62,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        tabBarIcon: ({ focused, color, size }) => {
          const icons = {
            Home: focused ? 'home' : 'home-outline',
            Jobs: focused ? 'briefcase' : 'briefcase-outline',
            Earnings: focused ? 'wallet' : 'wallet-outline',
            Schedule: focused ? 'calendar' : 'calendar-outline',
            Profile: focused ? 'person' : 'person-outline',
          };
          return <Ionicons name={icons[route.name]} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={Screen07_HomeDashboard} options={{ tabBarLabel: t('tabHome', 'Home') }} />
      <Tab.Screen name="Jobs" component={Screen08_JobRequest} options={{ tabBarLabel: t('tabJobs', 'Jobs') }} />
      <Tab.Screen name="Earnings" component={Screen11_EarningsWallet} options={{ tabBarLabel: t('tabEarnings', 'Earnings') }} />
      <Tab.Screen name="Schedule" component={Screen14_Schedule} options={{ tabBarLabel: t('tabSchedule', 'Schedule') }} />
      <Tab.Screen name="Profile" component={Screen16_Profile} options={{ tabBarLabel: t('tabProfile', 'Profile') }} />
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;
