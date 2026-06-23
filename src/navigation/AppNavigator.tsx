import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import TaskListScreen from '../screens/TaskListScreen.tsx';

export type RootStackParamList = {
  TaskList: undefined;
  AddTask: undefined;
  TaskDetail: { taskId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="TaskList"
        screenOptions={{
          headerStyle: { backgroundColor: '#1A1A2E' },
          headerTitleStyle: { color: '#FFFFFF', fontWeight: '600', fontSize: 18 },
          headerTintColor: '#FFFFFF',
          contentStyle: { backgroundColor: '#F8F9FA' },
        }}
      >
        <Stack.Screen name="TaskList" component={TaskListScreen} options={{ title: 'My Tasks' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
