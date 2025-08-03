import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Alert, Share } from 'react-native';
import { Copy, Share2, Trash2, Edit3, RefreshCw, ThumbsUp, ThumbsDown } from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import colors from '@/constants/colors';
import { Message } from '@/types/chat';

interface MessageActionsProps {
  message: Message;
  onDelete?: (messageId: string) => void;
  onEdit?: (messageId: string, newContent: string) => void;
  onRegenerate?: (messageId: string) => void;
  onFeedback?: (messageId: string, feedback: 'positive' | 'negative') => void;
}

const MessageActions: React.FC<MessageActionsProps> = ({
  message,
  onDelete,
  onEdit,
  onRegenerate,
  onFeedback,
}) => {
  const [feedbackGiven, setFeedbackGiven] = useState<'positive' | 'negative' | null>(null);

  const handleCopy = async () => {
    try {
      const textContent = message.content
        .filter(part => part.type === 'text')
        .map(part => part.content)
        .join('\n');
      
      await Clipboard.setStringAsync(textContent);
      Alert.alert('تم النسخ', 'تم نسخ النص إلى الحافظة');
    } catch (error) {
      Alert.alert('خطأ', 'فشل في نسخ النص');
    }
  };

  const handleShare = async () => {
    try {
      const textContent = message.content
        .filter(part => part.type === 'text')
        .map(part => part.content)
        .join('\n');
      
      await Share.share({
        message: textContent,
        title: 'مشاركة رسالة من المساعد الذكي',
      });
    } catch (error) {
      Alert.alert('خطأ', 'فشل في مشاركة النص');
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'حذف الرسالة',
      'هل أنت متأكد من حذف هذه الرسالة؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        { 
          text: 'حذف', 
          style: 'destructive',
          onPress: () => onDelete?.(message.id)
        },
      ]
    );
  };

  const handleFeedback = (type: 'positive' | 'negative') => {
    setFeedbackGiven(type);
    onFeedback?.(message.id, type);
  };

  const handleRegenerate = () => {
    Alert.alert(
      'إعادة إنشاء الرد',
      'هل تريد إعادة إنشاء هذا الرد؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        { 
          text: 'إعادة إنشاء', 
          onPress: () => onRegenerate?.(message.id)
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.actionButton} onPress={handleCopy}>
        <Copy size={16} color={colors.placeholder} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
        <Share2 size={16} color={colors.placeholder} />
      </TouchableOpacity>

      {message.role === 'assistant' && onRegenerate && (
        <TouchableOpacity style={styles.actionButton} onPress={handleRegenerate}>
          <RefreshCw size={16} color={colors.placeholder} />
        </TouchableOpacity>
      )}

      {message.role === 'assistant' && onFeedback && (
        <>
          <TouchableOpacity 
            style={[
              styles.actionButton,
              feedbackGiven === 'positive' && styles.feedbackActive
            ]} 
            onPress={() => handleFeedback('positive')}
          >
            <ThumbsUp 
              size={16} 
              color={feedbackGiven === 'positive' ? colors.success : colors.placeholder} 
            />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[
              styles.actionButton,
              feedbackGiven === 'negative' && styles.feedbackActive
            ]} 
            onPress={() => handleFeedback('negative')}
          >
            <ThumbsDown 
              size={16} 
              color={feedbackGiven === 'negative' ? colors.error : colors.placeholder} 
            />
          </TouchableOpacity>
        </>
      )}

      {onDelete && (
        <TouchableOpacity style={styles.actionButton} onPress={handleDelete}>
          <Trash2 size={16} color={colors.error} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 12,
  },
  actionButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  feedbackActive: {
    backgroundColor: colors.primary + '20',
    borderColor: colors.primary,
  },
});

export default MessageActions;

