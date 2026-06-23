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
import { useTheme } from '../hooks/useTheme';

const TaskDetailScreen = ({ navigation, route }: TaskDetailScreenProps) => {
  const { taskId } = route.params;
  const { showToast } = useToast();
  const { colors } = useTheme();
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
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>

      <View style={[styles.titleCard, { backgroundColor: colors.surface }]}>
        <Text style={[styles.statusLabel, task.completed ? { color: colors.success } : { color: colors.tertiaryLabel }]}>
          {task.completed ? 'Completed' : 'In Progress'}
        </Text>
        <Text style={[styles.title, { color: colors.label }, task.completed && { color: colors.tertiaryLabel, textDecorationLine: 'line-through' }]}>{task.title}</Text>
        {!!task.description && (
          <Text style={[styles.description, { color: colors.secondaryLabel }]}>{task.description}</Text>
        )}
      </View>

      <Text style={[styles.sectionLabel, { color: colors.tertiaryLabel }]}>DETAILS</Text>
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: colors.label }]}>Created</Text>
          <Text style={[styles.infoValue, { color: colors.tertiaryLabel }]}>{dateStr}</Text>
        </View>
        <View style={[styles.infoSeparator, { backgroundColor: colors.separator }]} />
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: colors.label }]}>Source</Text>
          <Text style={[styles.infoValue, { color: colors.tertiaryLabel }]}>{task.fromApi ? 'dummyjson API' : 'Added locally'}</Text>
        </View>
      </View>

      <View style={[styles.section, styles.sectionSpaced, { backgroundColor: colors.surface }]}>
        <TouchableOpacity style={styles.actionRow} onPress={handleToggle} activeOpacity={0.5}>
          <Text style={[styles.actionText, task.completed ? { color: colors.tertiaryLabel } : { color: colors.success }]}>
            {task.completed ? 'Mark as Incomplete' : 'Mark as Complete'}
          </Text>
          <Ionicons name="chevron-forward" size={14} color={colors.quaternaryLabel} />
        </TouchableOpacity>
      </View>

      <View style={[styles.section, styles.sectionSpaced, { backgroundColor: colors.surface }]}>
        <TouchableOpacity style={styles.actionRow} onPress={handleDelete} activeOpacity={0.5}>
          <Text style={[styles.actionDelete, { color: colors.destructive }]}>Delete Task</Text>
          <Ionicons name="chevron-forward" size={14} color={colors.quaternaryLabel} />
        </TouchableOpacity>
      </View>

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingTop: 20 },

  titleCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  statusLabel: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 28,
    marginBottom: 6,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    marginTop: 4,
  },

  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  section: {
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
  infoSeparator: { height: 0.5, marginLeft: 16 },
  infoLabel: { fontSize: 15 },
  infoValue: { fontSize: 15 },

  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 15,
  },
  actionText: { fontSize: 16, fontWeight: '500' },
  actionDelete: { fontSize: 16, fontWeight: '500' },
});

export default TaskDetailScreen;
