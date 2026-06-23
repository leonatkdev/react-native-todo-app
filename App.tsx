import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator.tsx';
import { ToastProvider } from './src/components/Toast';

export default function App() {
  return (
    <SafeAreaProvider>
      <ToastProvider>
        <StatusBar style="light" />
        <AppNavigator />
      </ToastProvider>
    </SafeAreaProvider>
  );
}
