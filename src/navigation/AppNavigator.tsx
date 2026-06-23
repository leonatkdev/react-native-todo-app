import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

import TaskListScreen from '../screens/TaskListScreen';
import AddTaskScreen from '../screens/AddTaskScreen';
import TaskDetailScreen from '../screens/TaskDetailScreen';
import { RootStackParamList } from '../types/navigation';
import { useTheme } from '../hooks/useTheme';

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  const { colors, isDark, toggleTheme } = useTheme();

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="TaskList"
          screenOptions={{
            headerStyle: { backgroundColor: colors.surface },
            headerTitleStyle: { color: colors.label, fontWeight: '600' as const, fontSize: 17 },
            headerTintColor: colors.tint,
            headerShadowVisible: false,
            contentStyle: { backgroundColor: colors.background },
          }}
        >
          <Stack.Screen
            name="TaskList"
            component={TaskListScreen}
            options={({ navigation }) => ({
              title: 'My Tasks',
              headerLeft: () => (
                <TouchableOpacity
                  onPress={toggleTheme}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name={isDark ? 'sunny-outline' : 'moon-outline'} size={22} color={colors.tint} />
                </TouchableOpacity>
              ),
              headerRight: () => (
                <TouchableOpacity
                  onPress={() => navigation.navigate('AddTask')}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="add" size={26} color={colors.tint} />
                </TouchableOpacity>
              ),
            })}
          />
          <Stack.Screen
            name="AddTask"
            component={AddTaskScreen}
            options={({ navigation }) => ({
              title: 'New Task',
              presentation: 'modal',
              headerRight: () => (
                <TouchableOpacity
                  onPress={() => navigation.goBack()}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="close" size={24} color={colors.tint} />
                </TouchableOpacity>
              ),
            })}
          />
          <Stack.Screen name="TaskDetail" component={TaskDetailScreen} options={{ title: '' }} />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
};

export default AppNavigator;
