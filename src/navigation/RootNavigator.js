// AI-assisted: see docs/AI_LOG.md #18

import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import useSession from '../hooks/useSession'
import LoadingScreen from '../screens/LoadingScreen'
import LoginScreen from '../screens/LoginScreen'
import HomeScreen from '../screens/HomeScreen'
import RegistrationTabs from './RegistrationTabs'

const Stack = createNativeStackNavigator()

// Muestra una sola pantalla según sessionState; al cambiar el estado, el navegador cambia solo
export default function RootNavigator() {
  const { sessionState } = useSession()

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
        <Stack.Screen name="Home" component={HomeScreen} />
      )}
    </Stack.Navigator>
  )
}
