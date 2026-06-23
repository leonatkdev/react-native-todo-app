import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getTodos, deleteTodo, updateTodo, getApiId } from '../services/api';
import { getTasks, setTasks, removeTask, updateTask, watchTasks } from '../store/taskStore';
import { TaskListScreenProps } from '../types/navigation';
import { Task, FilterType } from '../types/task';
import { useToast } from '../components/Toast';
import { useTheme } from '../hooks/useTheme';

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
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const searchRef = useRef<TextInput>(null);
  const [tasks, setLocalTasks] = useState<Task[]>(() => getTasks());
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');

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

  const activeCount = tasks.filter(task => !task.completed).length;
  const completedCount = tasks.filter(task => task.completed).length;

  const filterCounts: Record<FilterType, number> = {
    all: tasks.length,
    active: activeCount,
    done: completedCount,
  };

  const filtered = tasks.filter(task => {
    if (filter === 'active' && task.completed) return false;
    if (filter === 'done' && !task.completed) return false;
    if (searchQuery.trim()) {
      return task.title.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.tertiaryLabel} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.segmentedWrap}>
        <View style={[styles.segmented, { backgroundColor: colors.surfaceSecondary }]}>
          {FILTERS.map(f => (
            <TouchableOpacity
              key={f.key}
              style={[styles.segment, filter === f.key && styles.segmentActive, filter === f.key && { backgroundColor: colors.surface }]}
              onPress={() => setFilter(f.key)}
            >
              <View style={styles.segmentInner}>
                <Text style={[styles.segmentText, { color: colors.secondaryLabel }, filter === f.key && { color: colors.label, fontWeight: '600' }]}>
                  {f.label}
                </Text>
                <Text style={[styles.segmentBadge, { color: colors.tertiaryLabel }, filter === f.key && { color: colors.secondaryLabel }]}>
                  {filterCounts[f.key]}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        contentContainerStyle={filtered.length === 0 ? styles.listEmpty : styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => fetchTasks(true)} tintColor={colors.tertiaryLabel} />
        }
        ItemSeparatorComponent={() => <View style={[styles.separator, { backgroundColor: colors.separator }]} />}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            style={[
              styles.row,
              { backgroundColor: colors.surface },
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
              <View style={[styles.checkbox, { borderColor: colors.quaternaryLabel }, item.completed && { backgroundColor: colors.success, borderColor: colors.success }]}>
                {item.completed && <Ionicons name="checkmark" size={12} color="#FFFFFF" />}
              </View>
            </TouchableOpacity>

            <Text style={[styles.taskTitle, { color: colors.label }, item.completed && { color: colors.tertiaryLabel, textDecorationLine: 'line-through' }]} numberOfLines={2}>
              {item.title}
            </Text>

            <View style={styles.rowTrailing}>
              <TouchableOpacity
                onPress={() => handleDelete(item)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="trash-outline" size={20} color={colors.quaternaryLabel} />
              </TouchableOpacity>
              <Ionicons name="chevron-forward" size={20} color={colors.quaternaryLabel} />
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={[styles.emptyTitle, { color: colors.label }]}>{getEmptyState(filter).title}</Text>
            <Text style={[styles.emptyHint, { color: colors.tertiaryLabel }]}>{getEmptyState(filter).hint}</Text>
          </View>
        }
      />

      <BlurView
        intensity={80}
        tint={isDark ? 'dark' : 'light'}
        style={[styles.searchBar, { borderTopColor: colors.separatorOpaque, paddingBottom: insets.bottom + 8 }]}
      >
        <TouchableOpacity style={[styles.searchInner, { backgroundColor: colors.searchPill }]} onPress={() => searchRef.current?.focus()} activeOpacity={1}>
          <Ionicons name="search" size={16} color={colors.tertiaryLabel} />
          <TextInput
            ref={searchRef}
            style={[styles.searchInput, { color: colors.label }]}
            placeholder="Search"
            placeholderTextColor={colors.tertiaryLabel}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
        </TouchableOpacity>
      </BlurView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  segmentedWrap: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4 },
  segmented: {
    flexDirection: 'row',
    borderRadius: 9,
    padding: 2,
  },
  segment: { flex: 1, paddingVertical: 7, borderRadius: 7, alignItems: 'center' },
  segmentActive: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  segmentInner: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  segmentText: { fontSize: 13, fontWeight: '500' },
  segmentBadge: { fontSize: 13, fontWeight: '500' },
  list: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 40 },
  listEmpty: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },

  separator: { height: 0.5, marginLeft: 50 },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
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
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  taskTitle: { flex: 1, fontSize: 16 },

  rowTrailing: { flexDirection: 'row', alignItems: 'center', gap: 10, flexShrink: 0 },

  emptyBox: { alignItems: 'center', gap: 8 },
  emptyTitle: { fontSize: 17, fontWeight: '600' },
  emptyHint: { fontSize: 15, textAlign: 'center', lineHeight: 22 },

  searchBar: {
    borderTopWidth: 0.5,
    paddingHorizontal: 16,
    paddingTop: 10,
    overflow: 'hidden',
  },
  searchInner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 24,
    paddingHorizontal: 10,
    paddingVertical: 12,
    gap: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    padding: 0,
  },
});

export default TaskListScreen;
