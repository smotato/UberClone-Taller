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

export default function App() {
  return (
      // GestureHandlerRootView es requisito del Drawer; va por fuera de los demás providers
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <LanguageProvider>
            {/* AI-assisted: see docs/AI_LOG.md #18 */}
            <SessionProvider>
              <RegistrationProvider>
                <NavigationContainer>
                  <StatusBar style="light" />
                  <RootNavigator />
                </NavigationContainer>
              </RegistrationProvider>
            </SessionProvider>
          </LanguageProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
  );
}