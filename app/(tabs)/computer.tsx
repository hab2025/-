// app/(tabs)/computer.tsx - النسخة المعدلة لتعمل مع React Native

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { useComputerAgentState } from '@/hooks/computer-agent-store'; // سنستورد الـ hook الذي أنشأناه

const ComputerControlUI = () => {
  const {
    session,
    isInitializing,
    isProcessing,
    currentTask,
    progress,
    actions,
    lastScreenshot,
    error,
    isReady,
    actionCount,
    successfulActions,
    failedActions,
    initializeSandbox,
    destroySandbox,
    executeTask,
    takeScreenshot,
    clearActions,
  } = useComputerAgentState();

  const [taskInput, setTaskInput] = useState('');

  const handleExecuteTask = async () => {
    if (!taskInput.trim()) return;
    try {
      await executeTask(taskInput.trim());
    } catch (err) {
      console.error('Task failed:', err);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header */}
      <View style={styles.card}>
        <Text style={styles.headerTitle}>🖥️ مساعد التحكم في الكمبيوتر</Text>
        <View style={styles.statusContainer}>
          <View style={[styles.statusDot, { backgroundColor: isReady ? '#22c55e' : '#ef4444' }]} />
          <Text style={styles.statusText}>{isReady ? 'جاهز' : 'غير متصل'}</Text>
        </View>
      </View>

      {/* Sandbox Control */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🏗️ إدارة بيئة العمل</Text>
        {!session ? (
          <TouchableOpacity onPress={initializeSandbox} disabled={isInitializing} style={[styles.button, styles.primaryButton]}>
            {isInitializing ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>🚀 إنشاء بيئة عمل جديدة</Text>
            )}
          </TouchableOpacity>
        ) : (
          <View style={styles.buttonRow}>
            <TouchableOpacity onPress={takeScreenshot} disabled={isProcessing} style={[styles.button, styles.secondaryButton]}>
              <Text style={styles.buttonText}>📸 لقطة شاشة</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={destroySandbox} disabled={isProcessing} style={[styles.button, styles.dangerButton]}>
              <Text style={styles.buttonText}>🗑️ إغلاق البيئة</Text>
            </TouchableOpacity>
          </View>
        )}
        {(currentTask || isProcessing) && (
          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>{currentTask}</Text>
            <View style={styles.progressBarBackground}>
              <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
            </View>
          </View>
        )}
        {error && <Text style={styles.errorText}>❌ {error}</Text>}
      </View>

      {/* Task Input */}
      {isReady && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🎯 تنفيذ مهمة جديدة</Text>
          <TextInput
            style={styles.input}
            value={taskInput}
            onChangeText={setTaskInput}
            placeholder="مثال: افتح متصفح الويب وابحث عن الطقس"
            placeholderTextColor="#9ca3af"
            editable={!isProcessing}
          />
          <TouchableOpacity onPress={handleExecuteTask} disabled={isProcessing || !taskInput.trim()} style={[styles.button, styles.primaryButton]}>
            <Text style={styles.buttonText}>▶️ تنفيذ</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Screenshot */}
      {lastScreenshot && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📸 آخر لقطة شاشة</Text>
          <Image source={{ uri: lastScreenshot }} style={styles.screenshot} resizeMode="contain" />
        </View>
      )}

      {/* Actions Log */}
      {actions.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📜 سجل العمليات</Text>
          {actions.slice().reverse().map(action => (
            <View key={action.id} style={[styles.logItem, { borderLeftColor: action.success ? '#22c55e' : '#ef4444' }]}>
              <Text style={styles.logCommand}>{action.command}</Text>
              {action.output && <Text style={styles.logOutput}>النتيجة: {action.output}</Text>}
              {action.error && <Text style={styles.logError}>خطأ: {action.error}</Text>}
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  contentContainer: { padding: 16 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#111827', marginBottom: 8 },
  statusContainer: { flexDirection: 'row', alignItems: 'center' },
  statusDot: { width: 12, height: 12, borderRadius: 6, marginRight: 8 },
  statusText: { fontSize: 14, color: '#4b5563' },
  cardTitle: { fontSize: 18, fontWeight: '600', color: '#1f2937', marginBottom: 12 },
  button: { paddingVertical: 12, paddingHorizontal: 20, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  primaryButton: { backgroundColor: '#2563eb' },
  secondaryButton: { backgroundColor: '#16a34a' },
  dangerButton: { backgroundColor: '#dc2626' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '500' },
  buttonRow: { flexDirection: 'row', gap: 12 },
  progressContainer: { marginTop: 16 },
  progressText: { color: '#1e3a8a', marginBottom: 8 },
  progressBarBackground: { height: 8, backgroundColor: '#dbeafe', borderRadius: 4, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: '#2563eb' },
  errorText: { marginTop: 12, color: '#b91c1c', backgroundColor: '#fee2e2', padding: 8, borderRadius: 6 },
  input: { height: 50, borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, paddingHorizontal: 12, marginBottom: 12, fontSize: 16, color: '#111827' },
  screenshot: { width: '100%', height: 200, borderRadius: 8, borderWidth: 1, borderColor: '#e5e7eb' },
  logItem: { borderLeftWidth: 4, paddingLeft: 12, marginBottom: 8, backgroundColor: '#f9fafb', padding: 8, borderRadius: 4 },
  logCommand: { fontWeight: 'bold', color: '#374151' },
  logOutput: { color: '#4b5563', marginTop: 4 },
  logError: { color: '#b91c1c', marginTop: 4 },
});

export default ComputerControlUI;
