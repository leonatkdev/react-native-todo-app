import { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { addTodo } from '../services/api';
import { addTask } from '../store/taskStore';
import { AddTaskScreenProps } from '../types/navigation';
import { useToast } from '../components/Toast';

const TITLE_MIN = 3;
const TITLE_MAX = 100;

const AddTaskScreen = ({ navigation }: AddTaskScreenProps) => {
  const insets = useSafeAreaInsets();
  const { showToast } = useToast();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [titleError, setTitleError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [titleFocused, setTitleFocused] = useState(false);
  const [descFocused, setDescFocused] = useState(false);
  const descRef = useRef<TextInput>(null);

  const validate = (value: string): string => {
    if (!value.trim()) return 'Title is required';
    if (value.trim().length < TITLE_MIN) return `At least ${TITLE_MIN} characters`;
    return '';
  };

  const handleTitleChange = (text: string) => {
    if (text.length <= TITLE_MAX) {
      setTitle(text);
      if (titleError) setTitleError(validate(text));
    }
  };

  const handleSubmit = async () => {
    const err = validate(title);
    if (err) { setTitleError(err); return; }

    setSubmitting(true);
    try {
      const apiTask = await addTodo(title.trim());
      addTask({ ...apiTask, description: description.trim() });
    } catch {
      addTask({
        id: `local-${Date.now()}`,
        title: title.trim(),
        description: description.trim(),
        completed: false,
        createdAt: Date.now(),
        fromApi: false,
      });
      showToast('Saved offline', 'info');
    } finally {
      setSubmitting(false);
      navigation.goBack();
    }
  };

  const canSubmit = title.trim().length >= TITLE_MIN && !submitting;

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >

      
        <Text style={styles.fieldLabel}>
          <Ionicons name="folder-open-outline" size={16} color="#8E8E93" />
          {' TITLE '}
          <Text style={styles.required}>*</Text>
        </Text>
        <View style={[styles.card, titleFocused && styles.cardFocused, titleError ? styles.cardError : null]}>
          <TextInput
            style={styles.input}
            placeholder="What needs to be done?"
            placeholderTextColor="#C7C7CC"
            value={title}
            onChangeText={handleTitleChange}
            onFocus={() => setTitleFocused(true)}
            onBlur={() => { setTitleFocused(false); setTitleError(validate(title)); }}
            maxLength={TITLE_MAX}
            autoFocus
            returnKeyType="next"
            onSubmitEditing={() => descRef.current?.focus()}
          />
        </View>
        <View style={styles.fieldFooter}>
          {titleError
            ? <Text style={styles.errorText}>{titleError}</Text>
            : <View />
          }
          <Text style={[styles.charCount, title.length >= TITLE_MAX * 0.85 && styles.charCountWarn]}>
            {title.length}/{TITLE_MAX}
          </Text>
        </View>


        <Text style={[styles.fieldLabel, styles.fieldLabelSpaced]}>
          <Ionicons name="document-text-outline" size={16} color="#8E8E93" />
          {' DESCRIPTION'}
        </Text>
        <View style={[styles.card, descFocused && styles.cardFocused]}>
          <TextInput
            ref={descRef}
            style={[styles.input, styles.inputMulti]}
            placeholder="Add notes or details (optional)"
            placeholderTextColor="#C7C7CC"
            value={description}
            onChangeText={setDescription}
            onFocus={() => setDescFocused(true)}
            onBlur={() => setDescFocused(false)}
            multiline
            numberOfLines={4}
            maxLength={500}
            textAlignVertical="top"
          />
        </View>

      </ScrollView>

      {/* Pinned bottom button */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <TouchableOpacity
          style={[styles.button, !canSubmit && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={!canSubmit}
          activeOpacity={0.75}
        >
          {submitting ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <View style={styles.buttonContent}>
              <Ionicons name="checkmark-circle-outline" size={20} color="#FFFFFF" />
              <Text style={styles.buttonText}>Add Task</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F2F2F7' },
  scroll: { padding: 20, paddingTop: 28, paddingBottom: 12 },

  fieldLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#8E8E93',
    letterSpacing: 0.6,
    marginBottom: 8,
    paddingHorizontal: 4,
    textTransform: 'uppercase',
  },
  fieldLabelSpaced: { marginTop: 28 },
  required: { color: '#FF3B30' },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    borderColor: 'transparent',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  cardFocused: {
    borderColor: '#007AFF',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  cardError: {
    borderColor: '#FF3B30',
  },

  input: {
    fontSize: 16,
    color: '#000000',
    paddingVertical: 14,
  },
  inputMulti: { height: 130, paddingTop: 14 },

  fieldFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
    marginTop: 6,
    minHeight: 18,
  },
  errorText: { fontSize: 12, color: '#FF3B30' },
  charCount: { fontSize: 12, color: '#C7C7CC' },
  charCountWarn: { color: '#FF9500' },

  bottomBar: {
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: '#F2F2F7',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E5E5EA',
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    backgroundColor: '#C7C7CC',
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonContent: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  buttonText: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
});

export default AddTaskScreen;
