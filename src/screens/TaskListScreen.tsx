import { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getTodos, deleteTodo, updateTodo, getApiId } from '../services/api';
import { getTasks, setTasks, removeTask, updateTask, watchTasks } from '../store/taskStore';
import { TaskListScreenProps } from '../types/navigation';
import { Task, FilterType } from '../types/task';
import { useToast } from '../components/Toast';

const getEmptyState = (filter: FilterType): { title: string; hint: string } => {
  switch (filter) {
    case 'done':
      return { title: 'No completed tasks', hint: 'Mark a task complete to see it here' };
    case 'active':
      return { title: 'All done', hint: 'Everything is complete' };
    default:
      return { title: 'No tasks yet', hint: 'Tap + to add your first task' };
  }
};

const FILTERS: { key: FilterType; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'done', label: 'Done' },
];

const TaskListScreen = ({ navigation }: TaskListScreenProps) => {
  const { showToast } = useToast();
  const [tasks, setLocalTasks] = useState<Task[]>(() => getTasks());
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<FilterType>('all');

  const fetchTasks = async (isRefresh: boolean) => {
    try {
      isRefresh ? setRefreshing(true) : setLoading(true);
      const { tasks: apiTasks } = await getTodos(20, 0);
      setTasks(apiTasks);
    } catch {
      showToast('Could not load tasks');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const unsub = watchTasks(setLocalTasks);
    fetchTasks(false);
    return () => unsub();
  }, []);

  const handleToggle = async (task: Task) => {
    const next = !task.completed;
    updateTask(task.id, { completed: next });
    const apiId = getApiId(task.id);
    if (apiId) { try { await updateTodo(apiId, next); } catch { showToast('Sync failed'); } }
  };

  const handleDelete = (task: Task) => {
    Alert.alert('Delete Task', `Delete "${task.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          removeTask(task.id);
          const apiId = getApiId(task.id);
          if (apiId) { try { await deleteTodo(apiId); } catch { showToast('Sync failed'); } }
        },
      },
    ]);
  };

  const completedCount = tasks.filter(task => task.completed).length;
  const filtered = tasks.filter(task => {
    if (filter === 'active') return !task.completed;
    if (filter === 'done') return task.completed;
    return true;
  });

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color="#8E8E93" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.segmentedWrap}>
        <View style={styles.segmented}>
          {FILTERS.map(f => (
            <TouchableOpacity
              key={f.key}
              style={[styles.segment, filter === f.key && styles.segmentActive]}
              onPress={() => setFilter(f.key)}
            >
              <Text style={[styles.segmentText, filter === f.key && styles.segmentTextActive]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {tasks.length > 0 && (
        <Text style={styles.statsText}>{completedCount} of {tasks.length} completed</Text>
      )}

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        contentContainerStyle={filtered.length === 0 ? styles.listEmpty : styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => fetchTasks(true)} tintColor="#8E8E93" />
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            style={[
              styles.row,
              index === 0 && styles.rowFirst,
              index === filtered.length - 1 && styles.rowLast,
            ]}
            onPress={() => navigation.navigate('TaskDetail', { taskId: item.id })}
            activeOpacity={0.5}
          >
            <TouchableOpacity
              onPress={() => handleToggle(item)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <View style={[styles.checkbox, item.completed && styles.checkboxChecked]}>
                {item.completed && <Ionicons name="checkmark" size={12} color="#FFFFFF" />}
              </View>
            </TouchableOpacity>

            <Text style={[styles.taskTitle, item.completed && styles.taskTitleDone]} numberOfLines={2}>
              {item.title}
            </Text>

            <View style={styles.rowTrailing}>
              <TouchableOpacity
                onPress={() => handleDelete(item)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="trash-outline" size={20} color="#C7C7CC" />
              </TouchableOpacity>
              <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyTitle}>{getEmptyState(filter).title}</Text>
            <Text style={styles.emptyHint}>{getEmptyState(filter).hint}</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  segmentedWrap: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4 },
  segmented: {
    flexDirection: 'row',
    backgroundColor: '#E5E5EA',
    borderRadius: 9,
    padding: 2,
  },
  segment: { flex: 1, paddingVertical: 7, borderRadius: 7, alignItems: 'center' },
  segmentActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  segmentText: { fontSize: 13, fontWeight: '500', color: '#3C3C43' },
  segmentTextActive: { fontSize: 13, fontWeight: '600', color: '#000000' },

  statsText: {
    fontSize: 13,
    color: '#8E8E93',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 2,
  },

  list: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 40 },
  listEmpty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },

  separator: { height: 0.5, backgroundColor: '#E5E5EA', marginLeft: 50 },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 13,
    gap: 12,
  },
  rowFirst: { borderTopLeftRadius: 12, borderTopRightRadius: 12 },
  rowLast: { borderBottomLeftRadius: 12, borderBottomRightRadius: 12 },

  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: '#C7C7CC',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  checkboxChecked: { backgroundColor: '#34C759', borderColor: '#34C759' },

  taskTitle: { flex: 1, fontSize: 16, color: '#000000' },
  taskTitleDone: { color: '#8E8E93', textDecorationLine: 'line-through' },

  rowTrailing: { flexDirection: 'row', alignItems: 'center', gap: 10, flexShrink: 0 },

  emptyBox: { alignItems: 'center', gap: 8 },
  emptyTitle: { fontSize: 17, fontWeight: '600', color: '#000000' },
  emptyHint: { fontSize: 15, color: '#8E8E93', textAlign: 'center', lineHeight: 22 },
});

export default TaskListScreen;
