import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context'
import RegistrationScreen from './src/screens/PersonalDataScreen';
import { LanguageProvider } from './src/context/LanguageContext';
import { RegistrationProvider } from './src/context/RegistrationContext';
import { NavigationContainer } from '@react-navigation/native';
// AI-assisted: see docs/AI_LOG.md #18
import { SessionProvider } from './src/context/SessionContext';
import RootNavigator from './src/navigation/RootNavigator';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
// AI-assisted: see docs/AI_LOG.md #25
import { TripProvider } from './src/context/TripContext';
import { navigationRef } from './src/navigation/navigationRef';

export default function App() {
  return (
      // GestureHandlerRootView es requisito del Drawer; va por fuera de los demás providers
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <LanguageProvider>
            {/* AI-assisted: see docs/AI_LOG.md #18 */}
            <SessionProvider>
              {/* AI-assisted: see docs/AI_LOG.md #25 */}
              {/* TripProvider decide qué pantalla del viaje se muestra y navega con navigationRef */}
              <TripProvider>
                <RegistrationProvider>
                  <NavigationContainer ref={navigationRef}>
                    <StatusBar style="light" />
                    <RootNavigator />
                  </NavigationContainer>
                </RegistrationProvider>
              </TripProvider>
            </SessionProvider>
          </LanguageProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
  );
}