import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import PersonalDataScreen from '../screens/PersonalDataScreen';
import VehicleScreen from '../screens/VehicleScreen';
import DocumentsScreen from '../screens/DocumentsScreen';
import { sizes } from '../theme/theme';
import { colors, spacing, typography } from '../theme/theme';
import useLanguage from "../hooks/useLanguage";

const Tab = createBottomTabNavigator();

const TAB_ICONS = {
    PersonalData: ['person', 'person-outline'],
    Vehicle: ['car', 'car-outline'],
    Documents: ['document-text', 'document-text-outline']
};

export default function RegistrationTabs() {
  const { t } = useLanguage();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: { 
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
            borderTopWidth: 1,
            elevation: 0,
            shadowOpacity: 0,
            paddingTop: spacing.xs,
        },
        tabBarLabelStyle: {
          ...typography.caption,
          fontWeight: typography.fontWeight.semibold,
        },
        tabBarIcon: ({ focused, color }) => {
          const [active, inactive] = TAB_ICONS[route.name]
          return (
            <Ionicons
              name={focused ? active : inactive}
              size={sizes.iconMd}
              color={color}
            />
          )
        },
      })}
    >
      <Tab.Screen 
        name="PersonalData" 
        component={PersonalDataScreen}
        options={{ tabBarLabel: t('personalData') }} 
      />
      <Tab.Screen 
        name="Vehicle" 
        component={VehicleScreen} 
        options={{ tabBarLabel: t('vehicle') }} 
      />
      <Tab.Screen 
        name="Documents" 
        component={DocumentsScreen} 
        options={{ tabBarLabel: t('documents') }} 
      />
    </Tab.Navigator>
  );
}