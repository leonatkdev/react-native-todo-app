import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { updateTodo, deleteTodo, getApiId } from '../services/api';
import { getTasks, removeTask, updateTask, watchTasks } from '../store/taskStore';
import { TaskDetailScreenProps } from '../types/navigation';
import { Task } from '../types/task';
import { useToast } from '../components/Toast';

const TaskDetailScreen = ({ navigation, route }: TaskDetailScreenProps) => {
  const { taskId } = route.params;
  const { showToast } = useToast();
  const [task, setTask] = useState<Task | undefined>(() => getTasks().find(t => t.id === taskId));

  useEffect(() => {
    const unsub = watchTasks((tasks: Task[]) => {
      const found = tasks.find(t => t.id === taskId);
      if (!found) navigation.goBack();
      else setTask(found);
    });
    return () => unsub();
  }, [taskId, navigation]);

  if (!task) return null;

  const handleToggle = async () => {
    const next = !task!.completed;
    updateTask(taskId, { completed: next });
    const apiId = getApiId(taskId);
    if (apiId) { try { await updateTodo(apiId, next); } catch { showToast('Sync failed'); } }
  };

  const handleDelete = () => {
    Alert.alert('Delete Task', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          removeTask(taskId);
          const apiId = getApiId(taskId);
          if (apiId) { try { await deleteTodo(apiId); } catch { showToast('Sync failed'); } }
          navigation.goBack();
        },
      },
    ]);
  };

  const dateStr = new Date(task.createdAt).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      <View style={styles.titleCard}>
        <Text style={[styles.statusLabel, task.completed ? styles.statusDone : styles.statusPending]}>
          {task.completed ? 'Completed' : 'In Progress'}
        </Text>
        <Text style={[styles.title, task.completed && styles.titleDone]}>{task.title}</Text>
        {!!task.description && (
          <Text style={styles.description}>{task.description}</Text>
        )}
      </View>

      <Text style={styles.sectionLabel}>DETAILS</Text>
      <View style={styles.section}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Created</Text>
          <Text style={styles.infoValue}>{dateStr}</Text>
        </View>
        <View style={styles.infoSeparator} />
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Source</Text>
          <Text style={styles.infoValue}>{task.fromApi ? 'dummyjson API' : 'Added locally'}</Text>
        </View>
      </View>

      <View style={[styles.section, styles.sectionSpaced]}>
        <TouchableOpacity style={styles.actionRow} onPress={handleToggle} activeOpacity={0.5}>
          <Text style={[styles.actionText, task.completed ? styles.actionUndo : styles.actionDone]}>
            {task.completed ? 'Mark as Incomplete' : 'Mark as Complete'}
          </Text>
          <Ionicons name="chevron-forward" size={14} color="#C7C7CC" />
        </TouchableOpacity>
      </View>

      <View style={[styles.section, styles.sectionSpaced]}>
        <TouchableOpacity style={styles.actionRow} onPress={handleDelete} activeOpacity={0.5}>
          <Text style={styles.actionDelete}>Delete Task</Text>
          <Ionicons name="chevron-forward" size={14} color="#C7C7CC" />
        </TouchableOpacity>
      </View>

    </ScrollView>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  content: { padding: 16, paddingTop: 20 },

  titleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  statusLabel: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 8,
  },
  statusDone: { color: '#34C759' },
  statusPending: { color: '#8E8E93' },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000000',
    lineHeight: 28,
    marginBottom: 6,
  },
  titleDone: { color: '#8E8E93', textDecorationLine: 'line-through' },
  description: {
    fontSize: 15,
    color: '#3C3C43',
    lineHeight: 22,
    marginTop: 4,
  },

  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8E8E93',
    letterSpacing: 0.5,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  sectionSpaced: { marginTop: 10 },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  infoSeparator: { height: 0.5, backgroundColor: '#E5E5EA', marginLeft: 16 },
  infoLabel: { fontSize: 15, color: '#000000' },
  infoValue: { fontSize: 15, color: '#8E8E93' },

  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 15,
  },
  actionText: { fontSize: 16 },
  actionDone: { color: '#34C759', fontWeight: '500' },
  actionUndo: { color: '#8E8E93', fontWeight: '500' },
  actionDelete: { fontSize: 16, color: '#FF3B30', fontWeight: '500' },
});

export default TaskDetailScreen;
