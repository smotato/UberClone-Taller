// AI-assisted: see docs/AI_LOG.md #13

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import PersonalDataScreen from '../screens/PersonalDataScreen';
import VehicleScreen from '../screens/VehicleScreen';
import DocumentsScreen from '../screens/DocumentsScreen';
import RegistrationTabBar from '../components/RegistrationTabBar';

const Tab = createBottomTabNavigator();

export default function RegistrationTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <RegistrationTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="PersonalData" component={PersonalDataScreen} />
      <Tab.Screen name="Vehicle" component={VehicleScreen} />
      <Tab.Screen name="Documents" component={DocumentsScreen} />
    </Tab.Navigator>
  );
}