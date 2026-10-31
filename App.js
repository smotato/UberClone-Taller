import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context'
import RegistrationScreen from './src/screens/PersonalDataScreen';
import { LanguageProvider } from './src/context/LanguageContext';
import { NavigationContainer } from '@react-navigation/native';
import RegistrationTabs from './src/navigation/RegistrationTabs';

export default function App() {
  return (
      <SafeAreaProvider>
        <LanguageProvider>
          <NavigationContainer>
            <StatusBar style="light" />
            <RegistrationTabs />
          </NavigationContainer>
        </LanguageProvider>
      </SafeAreaProvider>
  );
}