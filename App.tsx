import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator.tsx';
import { ToastProvider } from './src/components/Toast';
import { ThemeProvider } from './src/hooks/useTheme';

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <ToastProvider>
          <AppNavigator />
        </ToastProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
