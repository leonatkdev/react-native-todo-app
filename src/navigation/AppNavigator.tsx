import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import TaskListScreen from '../screens/TaskListScreen';
import AddTaskScreen from '../screens/AddTaskScreen';
import TaskDetailScreen from '../screens/TaskDetailScreen';
import { RootStackParamList } from '../types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="TaskList"
        screenOptions={{
          headerStyle: { backgroundColor: '#FFFFFF' },
          headerTitleStyle: { color: '#000000', fontWeight: '600' as const, fontSize: 17 },
          headerTintColor: '#007AFF',
          headerShadowVisible: false,
          contentStyle: { backgroundColor: '#F2F2F7' },
        }}
      >
        <Stack.Screen
          name="TaskList"
          component={TaskListScreen}
          options={({ navigation }) => ({
            title: 'My Tasks',
            headerRight: () => (
              <TouchableOpacity
                onPress={() => navigation.navigate('AddTask')}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="add" size={26} color="#007AFF" />
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
                <Ionicons name="close" size={24} color="#007AFF" />
              </TouchableOpacity>
            ),
          })}
        />
        <Stack.Screen name="TaskDetail" component={TaskDetailScreen} options={{ title: '' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
