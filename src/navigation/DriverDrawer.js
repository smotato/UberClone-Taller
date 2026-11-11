// AI-assisted: see docs/AI_LOG.md #19
import React from 'react'
import { createDrawerNavigator } from '@react-navigation/drawer'
import { Ionicons } from '@expo/vector-icons'
import { colors, radius, typography } from '../theme/theme'
import useLanguage from '../hooks/useLanguage'
import DriverDrawerContent from '../components/DriverDrawerContent'
import HomeScreen from '../screens/HomeScreen'
import EarningsScreen from '../screens/EarningsScreen'
import HistoryScreen from '../screens/HistoryScreen'
import ProfileScreen from '../screens/ProfileScreen'

const Drawer = createDrawerNavigator()

// Ícono de cada opción del Drawer
const drawerIcon = (name) => ({ color, size }) => (
  <Ionicons name={name} size={size} color={color} />
)

// Menú principal del conductor. Inicio no lleva cabecera: el mapa ocupa toda la pantalla
export default function DriverDrawer() {
  const { t } = useLanguage()

  return (
    <Drawer.Navigator
      initialRouteName="Home"
      drawerContent={(props) => <DriverDrawerContent {...props} />}
      screenOptions={{
        // Cabecera negra para Ganancias, Historial y Perfil
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: colors.textOnPrimary,
        headerTitleStyle: typography.subtitle,
        // Opción activa e inactiva
        drawerActiveTintColor: colors.primary,
        drawerActiveBackgroundColor: colors.surfaceMuted,
        drawerInactiveTintColor: colors.textSecondary,
        drawerItemStyle: { borderRadius: radius.md },
        drawerLabelStyle: typography.bodyStrong,
      }}
    >
      <Drawer.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: t('drawer.home'),
          headerShown: false,
          drawerIcon: drawerIcon('home'),
        }}
      />
      <Drawer.Screen
        name="Earnings"
        component={EarningsScreen}
        options={{
          title: t('drawer.earnings'),
          drawerIcon: drawerIcon('cash-outline'),
        }}
      />
      <Drawer.Screen
        name="History"
        component={HistoryScreen}
        options={{
          title: t('drawer.history'),
          drawerIcon: drawerIcon('time-outline'),
        }}
      />
      <Drawer.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: t('drawer.profile'),
          drawerIcon: drawerIcon('person-outline'),
        }}
      />
    </Drawer.Navigator>
  )
}
