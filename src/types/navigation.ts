import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';

export type RootStackParamList = {
  TaskList: undefined;
  AddTask: undefined;
  TaskDetail: { taskId: string };
};

export type TaskListScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'TaskList'>;
};

export type AddTaskScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'AddTask'>;
};

export type TaskDetailScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'TaskDetail'>;
  route: RouteProp<RootStackParamList, 'TaskDetail'>;
};
