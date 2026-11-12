// AI-assisted: see docs/AI_LOG.md #18

import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import useSession from '../hooks/useSession'
import LoadingScreen from '../screens/LoadingScreen'
import LoginScreen from '../screens/LoginScreen'
import DriverDrawer from './DriverDrawer'
import RegistrationTabs from './RegistrationTabs'
// AI-assisted: see docs/AI_LOG.md #23
import TripDetailScreen from '../screens/TripDetailScreen'
import useLanguage from '../hooks/useLanguage'
import { colors, typography } from '../theme/theme'

const Stack = createNativeStackNavigator()

// Muestra una sola pantalla según sessionState; al cambiar el estado, el navegador cambia solo
export default function RootNavigator() {
  const { sessionState } = useSession()
  // AI-assisted: see docs/AI_LOG.md #23
  const { t } = useLanguage()

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {sessionState === 'loading' && (
        <Stack.Screen name="Loading" component={LoadingScreen} />
      )}
      {sessionState === 'unregistered' && (
        <Stack.Screen name="Registration" component={RegistrationTabs} />
      )}
      {sessionState === 'loggedOut' && (
        <Stack.Screen name="Login" component={LoginScreen} />
      )}
      {sessionState === 'loggedIn' && (
        <Stack.Group>
          {/* Main es el Drawer del conductor; las pantallas del viaje se agregarán después como hermanas */}
          <Stack.Screen name="Main" component={DriverDrawer} />
          {/* AI-assisted: see docs/AI_LOG.md #23 */}
          {/* Detalle de un viaje del Historial, con cabecera propia (negra, como las del Drawer) */}
          <Stack.Screen
            name="TripDetail"
            component={TripDetailScreen}
            options={{
              headerShown: true,
              title: t('tripDetail.title'),
              headerStyle: { backgroundColor: colors.primary },
              headerTintColor: colors.textOnPrimary,
              headerTitleStyle: typography.subtitle,
            }}
          />
        </Stack.Group>
      )}
    </Stack.Navigator>
  )
}
