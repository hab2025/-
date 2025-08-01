import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MessageSquare, Trash2 } from 'lucide-react-native';
import { ChatSession } from '@/types/chat';
import colors from '@/constants/colors';

interface ChatSessionItemProps {
  session: ChatSession;
  isActive: boolean;
  onPress: () => void;
  onDelete: () => void;
}

const ChatSessionItem: React.FC<ChatSessionItemProps> = ({
  session,
  isActive,
  onPress,
  onDelete,
}) => {
  const messageCount = session.messages.length;
  const lastUpdated = new Date(session.updatedAt).toLocaleDateString();

  return (
    <TouchableOpacity
      style={[
        styles.container,
        isActive && styles.activeContainer,
      ]}
      onPress={onPress}
      testID={`chat-session-${session.id}`}
    >
      <View style={styles.iconContainer}>
        <MessageSquare size={20} color={isActive ? colors.primary : colors.text} />
      </View>
      <View style={styles.content}>
        <Text 
          style={[styles.title, isActive && styles.activeText]} 
          numberOfLines={1}
        >
          {session.title}
        </Text>
        <Text style={styles.details}>
          {messageCount} messages • {lastUpdated}
        </Text>
      </View>
      <TouchableOpacity 
        style={styles.deleteButton}
        onPress={onDelete}
        testID={`delete-session-${session.id}`}
      >
        <Trash2 size={18} color={colors.error} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: colors.card,
  },
  activeContainer: {
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 2,
  },
  activeText: {
    color: colors.primary,
    fontWeight: '600',
  },
  details: {
    fontSize: 12,
    color: colors.placeholder,
  },
  deleteButton: {
    padding: 8,
  },
});

export default ChatSessionItem;

