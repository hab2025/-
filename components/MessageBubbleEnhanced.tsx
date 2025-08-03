import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Linking } from 'react-native';
import { User, Bot, Copy, ExternalLink, Play, Pause } from 'lucide-react-native';
import { Message, ContentPart } from '@/types/chat';
import colors from '@/constants/colors';
import MessageActions from './chat/MessageActions';
import { Audio } from 'expo-av';

interface MessageBubbleEnhancedProps {
  message: Message;
  onDelete?: (messageId: string) => void;
  onEdit?: (messageId: string, newContent: string) => void;
  onRegenerate?: (messageId: string) => void;
  onFeedback?: (messageId: string, feedback: 'positive' | 'negative') => void;
}

const MessageBubbleEnhanced: React.FC<MessageBubbleEnhancedProps> = ({ 
  message, 
  onDelete, 
  onEdit, 
  onRegenerate, 
  onFeedback 
}) => {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showActions, setShowActions] = useState(false);

  const isUser = message.role === 'user';
  const isThinking = message.isThinking;

  const playAudio = async (audioUri: string) => {
    try {
      if (sound) {
        await sound.unloadAsync();
      }
      
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: audioUri },
        { shouldPlay: true }
      );
      
      setSound(newSound);
      setIsPlaying(true);
      
      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setIsPlaying(false);
        }
      });
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  };

  const stopAudio = async () => {
    if (sound) {
      await sound.stopAsync();
      setIsPlaying(false);
    }
  };

  const renderContentPart = (part: ContentPart, index: number) => {
    switch (part.type) {
      case 'text':
        return (
          <Text key={index} style={[styles.messageText, isUser && styles.userMessageText]}>
            {part.content}
          </Text>
        );
      
      case 'image':
        return (
          <View key={index} style={styles.imageContainer}>
            <Image source={{ uri: part.content }} style={styles.messageImage} />
            {part.metadata?.description && (
              <Text style={styles.imageDescription}>{part.metadata.description}</Text>
            )}
          </View>
        );
      
      case 'audio':
        return (
          <View key={index} style={styles.audioContainer}>
            <TouchableOpacity
              style={styles.audioButton}
              onPress={() => isPlaying ? stopAudio() : playAudio(part.content)}
            >
              {isPlaying ? (
                <Pause size={20} color={colors.lightText} />
              ) : (
                <Play size={20} color={colors.lightText} />
              )}
            </TouchableOpacity>
            <Text style={styles.audioText}>
              {isPlaying ? 'جاري التشغيل...' : 'رسالة صوتية'}
            </Text>
          </View>
        );
      
      case 'file':
        return (
          <View key={index} style={styles.fileContainer}>
            <Text style={styles.fileName}>
              📎 {part.metadata?.fileName || 'ملف مرفق'}
            </Text>
            {part.metadata?.fileType && (
              <Text style={styles.fileType}>{part.metadata.fileType}</Text>
            )}
          </View>
        );
      
      case 'web_search':
        return (
          <View key={index} style={styles.searchResultsContainer}>
            <Text style={styles.searchTitle}>🔍 نتائج البحث:</Text>
            {part.metadata?.searchResults?.map((result: any, resultIndex: number) => (
              <TouchableOpacity
                key={resultIndex}
                style={styles.searchResult}
                onPress={() => result.url && Linking.openURL(result.url)}
              >
                <Text style={styles.searchResultTitle}>{result.title}</Text>
                <Text style={styles.searchResultSnippet}>{result.snippet}</Text>
                {result.url && (
                  <View style={styles.searchResultUrl}>
                    <ExternalLink size={12} color={colors.primary} />
                    <Text style={styles.searchResultUrlText}>{result.url}</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        );
      
      case 'live_search':
        return (
          <View key={index} style={styles.liveSearchContainer}>
            <Text style={styles.liveSearchTitle}>🔍 البحث المباشر:</Text>
            {part.metadata?.searchResults?.map((result: any, resultIndex: number) => (
              <TouchableOpacity
                key={resultIndex}
                style={styles.liveSearchResult}
                onPress={() => result.url && Linking.openURL(result.url)}
              >
                <View style={styles.liveSearchHeader}>
                  <Text style={styles.liveSearchResultTitle}>{result.title}</Text>
                  <Text style={styles.liveSearchSource}>{result.source}</Text>
                </View>
                <Text style={styles.liveSearchSnippet}>{result.snippet}</Text>
                {result.timestamp && (
                  <Text style={styles.liveSearchTimestamp}>
                    📅 {new Date(result.timestamp).toLocaleDateString('ar-SA')}
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        );
      
      case 'generated_image':
        return (
          <View key={index} style={styles.generatedImageContainer}>
            <Image source={{ uri: part.content }} style={styles.generatedImage} />
            {part.metadata?.prompt && (
              <Text style={styles.imagePrompt}>
                🎨 الوصف: {part.metadata.prompt}
              </Text>
            )}
          </View>
        );
      
      case 'code':
        return (
          <View key={index} style={styles.codeContainer}>
            <View style={styles.codeHeader}>
              <Text style={styles.codeLanguage}>
                {part.metadata?.codeLanguage || 'Code'}
              </Text>
              <TouchableOpacity style={styles.copyButton}>
                <Copy size={14} color={colors.primary} />
              </TouchableOpacity>
            </View>
            <Text style={styles.codeText}>{part.content}</Text>
          </View>
        );
      
      default:
        return (
          <Text key={index} style={[styles.messageText, isUser && styles.userMessageText]}>
            {part.content}
          </Text>
        );
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('ar-SA', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <View style={[styles.container, isUser && styles.userContainer]}>
      <TouchableOpacity
        style={[styles.bubble, isUser && styles.userBubble]}
        onLongPress={() => setShowActions(!showActions)}
        activeOpacity={0.8}
      >
        {/* Avatar */}
        <View style={[styles.avatar, isUser && styles.userAvatar]}>
          {isUser ? (
            <User size={16} color={colors.lightText} />
          ) : (
            <Bot size={16} color={colors.lightText} />
          )}
        </View>

        {/* Message Content */}
        <View style={styles.messageContent}>
          {/* Agent Type Indicator */}
          {!isUser && message.agentType && (
            <Text style={styles.agentType}>
              {message.agentType === 'general' ? '🤖 المساعد العام' :
               message.agentType === 'web_search' ? '🌐 وكيل البحث' :
               message.agentType === 'live_search_agent' ? '🔍 البحث المباشر' :
               message.agentType === 'image_generator' ? '🎨 منشئ الصور' :
               message.agentType === 'code_analyst' ? '💻 محلل الأكواد' :
               message.agentType === 'data_scientist' ? '📊 عالم البيانات' :
               message.agentType === 'translator' ? '🌐 المترجم' :
               message.agentType === 'creative_writer' ? '✍️ الكاتب المبدع' :
               message.agentType === 'financial_analyst' ? '💰 المحلل المالي' :
               message.agentType === 'travel_agent' ? '✈️ وكيل السفر' :
               message.agentType === 'health_advisor' ? '🏥 مستشار الصحة' :
               message.agentType === 'education_tutor' ? '📚 المعلم' :
               '🤖 وكيل ذكي'
              }
            </Text>
          )}

          {/* Thinking Indicator */}
          {isThinking && (
            <View style={styles.thinkingContainer}>
              <View style={styles.thinkingDots}>
                <View style={[styles.dot, styles.dot1]} />
                <View style={[styles.dot, styles.dot2]} />
                <View style={[styles.dot, styles.dot3]} />
              </View>
              <Text style={styles.thinkingText}>جاري التفكير...</Text>
            </View>
          )}

          {/* Message Parts */}
          {!isThinking && message.content.map((part, index) => renderContentPart(part, index))}

          {/* Timestamp */}
          <Text style={[styles.timestamp, isUser && styles.userTimestamp]}>
            {formatTimestamp(message.timestamp)}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Message Actions */}
      {showActions && (
        <MessageActions
          message={message}
          onDelete={onDelete}
          onEdit={onEdit}
          onRegenerate={onRegenerate}
          onFeedback={onFeedback}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginVertical: 4,
    marginHorizontal: 16,
    alignItems: 'flex-end',
  },
  userContainer: {
    flexDirection: 'row-reverse',
  },
  bubble: {
    flexDirection: 'row',
    maxWidth: '85%',
    backgroundColor: colors.card,
    borderRadius: 18,
    padding: 12,
    shadowColor: colors.darkOverlay,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  userBubble: {
    backgroundColor: colors.primary,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.placeholder,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  userAvatar: {
    backgroundColor: colors.primaryDark,
    marginRight: 0,
    marginLeft: 8,
  },
  messageContent: {
    flex: 1,
  },
  agentType: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '500',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 22,
  },
  userMessageText: {
    color: colors.lightText,
  },
  timestamp: {
    fontSize: 11,
    color: colors.placeholder,
    marginTop: 4,
    textAlign: 'left',
  },
  userTimestamp: {
    color: colors.lightText + '80',
    textAlign: 'right',
  },
  thinkingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  thinkingDots: {
    flexDirection: 'row',
    marginRight: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
    marginHorizontal: 1,
  },
  dot1: {
    animationDelay: '0s',
  },
  dot2: {
    animationDelay: '0.2s',
  },
  dot3: {
    animationDelay: '0.4s',
  },
  thinkingText: {
    fontSize: 14,
    color: colors.placeholder,
    fontStyle: 'italic',
  },
  imageContainer: {
    marginVertical: 8,
  },
  messageImage: {
    width: 200,
    height: 150,
    borderRadius: 12,
    resizeMode: 'cover',
  },
  imageDescription: {
    fontSize: 12,
    color: colors.placeholder,
    marginTop: 4,
    fontStyle: 'italic',
  },
  audioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 20,
    padding: 8,
    marginVertical: 4,
  },
  audioButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  audioText: {
    fontSize: 14,
    color: colors.text,
  },
  fileContainer: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 8,
    marginVertical: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  fileName: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  fileType: {
    fontSize: 12,
    color: colors.placeholder,
    marginTop: 2,
  },
  searchResultsContainer: {
    marginVertical: 8,
  },
  searchTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  searchResult: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 8,
    marginBottom: 6,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  searchResultTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 4,
  },
  searchResultSnippet: {
    fontSize: 12,
    color: colors.placeholder,
    lineHeight: 16,
    marginBottom: 4,
  },
  searchResultUrl: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchResultUrlText: {
    fontSize: 11,
    color: colors.primary,
    marginLeft: 4,
  },
  liveSearchContainer: {
    marginVertical: 8,
    backgroundColor: colors.success + '10',
    borderRadius: 12,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.success,
  },
  liveSearchTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.success,
    marginBottom: 8,
  },
  liveSearchResult: {
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 8,
    marginBottom: 6,
  },
  liveSearchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  liveSearchResultTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    flex: 1,
    marginRight: 8,
  },
  liveSearchSource: {
    fontSize: 11,
    color: colors.success,
    fontWeight: '500',
    backgroundColor: colors.success + '20',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  liveSearchSnippet: {
    fontSize: 12,
    color: colors.placeholder,
    lineHeight: 16,
    marginBottom: 4,
  },
  liveSearchTimestamp: {
    fontSize: 10,
    color: colors.placeholder,
    fontStyle: 'italic',
  },
  generatedImageContainer: {
    marginVertical: 8,
  },
  generatedImage: {
    width: 250,
    height: 250,
    borderRadius: 12,
    resizeMode: 'cover',
  },
  imagePrompt: {
    fontSize: 12,
    color: colors.placeholder,
    marginTop: 6,
    fontStyle: 'italic',
  },
  codeContainer: {
    backgroundColor: '#1e1e1e',
    borderRadius: 8,
    marginVertical: 4,
    overflow: 'hidden',
  },
  codeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#2d2d2d',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  codeLanguage: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '500',
  },
  copyButton: {
    padding: 4,
  },
  codeText: {
    fontSize: 14,
    color: '#ffffff',
    fontFamily: 'monospace',
    padding: 12,
    lineHeight: 20,
  },
});

export default MessageBubbleEnhanced;

