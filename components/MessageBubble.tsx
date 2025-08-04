import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { useLanguage } from '@/hooks/language-store';
import { User, Bot, ExternalLink, Play, FileText, Code, Search } from 'lucide-react-native';
import { Message, ContentPart } from '@/types/chat';
import colors from '@/constants/colors';
import CodeBlock from './CodeBlock';

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const { t } = useLanguage();
  const isUser = message.role === 'user';
  const isThinking = message.isThinking;

  const renderContentPart = (part: ContentPart, index: number) => {
    switch (part.type) {
      case 'text':
        if (part.content.trim() === '' && isThinking) {
          return (
            <View key={index} style={styles.thinkingContainer}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={styles.thinkingText}>{t('chat.thinking', 'Thinking...')}</Text>
            </View>
          );
        }
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
            <TouchableOpacity style={styles.audioPlayButton}>
              <Play size={20} color={colors.lightText} />
            </TouchableOpacity>
            <Text style={styles.audioText}>{t('chat.audioMessage', 'Audio Message')}</Text>
          </View>
        );

      case 'file':
        return (
          <View key={index} style={styles.fileContainer}>
            <FileText size={20} color={colors.primary} />
            <Text style={styles.fileName}>
              {part.metadata?.fileName || t('chat.attachedFile', 'Attached File')}
            </Text>
          </View>
        );

      case 'web_search':
        return (
          <View key={index} style={styles.searchContainer}>
            <View style={styles.searchHeader}>
              <Search size={16} color={colors.primary} />
              <Text style={styles.searchTitle}>{t('chat.searchResults', 'Search Results')}</Text>
            </View>
            <Text style={styles.searchContent}>{part.content}</Text>
            {part.metadata?.searchResults && (
              <View style={styles.searchResults}>
                {part.metadata.searchResults.slice(0, 3).map((result: any, idx: number) => (
                  <TouchableOpacity
                    key={idx}
                    style={styles.searchResultItem}
                    onPress={() => Linking.openURL(result.url)}
                  >
                    <Text style={styles.searchResultTitle} numberOfLines={1}>
                      {result.title}
                    </Text>
                    <Text style={styles.searchResultSnippet} numberOfLines={2}>
                      {result.snippet}
                    </Text>
                    <View style={styles.searchResultLink}>
                      <ExternalLink size={12} color={colors.primary} />
                      <Text style={styles.searchResultUrl} numberOfLines={1}>
                        {result.url}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        );

      case 'code':
        return (
          <CodeBlock
            key={index}
            code={part.content}
            language={part.metadata?.codeLanguage}
          />
        );

      case 'generated_image':
        return (
          <View key={index} style={styles.generatedImageContainer}>
            <Image source={{ uri: part.content }} style={styles.generatedImage} />
            {part.metadata?.prompt && (
              <Text style={styles.imagePrompt}>{t('chat.imagePrompt', 'Prompt:')} {part.metadata.prompt}</Text>
            )}
          </View>
        );

      case 'analysis':
        return (
          <View key={index} style={styles.analysisContainer}>
            <Text style={styles.analysisTitle}>
              {t('chat.analysisTitle', 'Analysis of')} {part.metadata?.analysisType || t('chat.analysisTypeContent', 'Content')}
            </Text>
            <Text style={styles.analysisContent}>{part.content}</Text>
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

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('ar-SA', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  return (
    <View style={[styles.container, isUser ? styles.userContainer : styles.assistantContainer]}>
      <View style={[styles.bubble, isUser ? styles.userBubble : styles.assistantBubble]}>
        <View style={styles.header}>
          <View style={styles.avatar}>
            {isUser ? (
              <User size={16} color={colors.lightText} />
            ) : (
              <Bot size={16} color={colors.lightText} />
            )}
          </View>
          <Text style={styles.roleText}>
            {isUser ? t('chat.you', 'You') : t('chat.assistant', 'Assistant')}
          </Text>
          {message.agentType && message.agentType !== 'general' && (
            <Text style={styles.agentType}>({t(`agent.${message.agentType}`, message.agentType)})</Text>
          )}
        </View>

        <View style={styles.content}>
          {message.content.map((part, index) => renderContentPart(part, index))}
        </View>

        <Text style={styles.timestamp}>
          {formatTime(message.timestamp)}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    paddingHorizontal: 8,
  },
  userContainer: {
    alignItems: 'flex-end',
  },
  assistantContainer: {
    alignItems: 'flex-start',
  },
  bubble: {
    maxWidth: '85%',
    borderRadius: 16,
    padding: 12,
  },
  userBubble: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderBottomLeftRadius: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.placeholder,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.placeholder,
  },
  agentType: {
    fontSize: 10,
    color: colors.placeholder,
    marginLeft: 4,
    fontStyle: 'italic',
  },
  content: {
    marginBottom: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    color: colors.text,
  },
  userMessageText: {
    color: colors.lightText,
  },
  timestamp: {
    fontSize: 10,
    color: colors.placeholder,
    textAlign: 'right',
    marginTop: 4,
  },
  thinkingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  thinkingText: {
    marginLeft: 8,
    fontSize: 14,
    color: colors.placeholder,
    fontStyle: 'italic',
  },
  imageContainer: {
    marginVertical: 4,
  },
  messageImage: {
    width: 200,
    height: 150,
    borderRadius: 8,
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
    borderRadius: 8,
    padding: 8,
    marginVertical: 4,
  },
  audioPlayButton: {
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 8,
    marginVertical: 4,
  },
  fileName: {
    fontSize: 14,
    color: colors.text,
    marginLeft: 8,
  },
  searchContainer: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 12,
    marginVertical: 4,
  },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  searchTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    marginLeft: 6,
  },
  searchContent: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
    marginBottom: 8,
  },
  searchResults: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 8,
  },
  searchResultItem: {
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchResultTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  searchResultSnippet: {
    fontSize: 12,
    color: colors.placeholder,
    lineHeight: 16,
    marginBottom: 4,
  },
  searchResultLink: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchResultUrl: {
    fontSize: 11,
    color: colors.primary,
    marginLeft: 4,
    flex: 1,
  },
  codeContainer: {
    backgroundColor: '#1e1e1e',
    borderRadius: 8,
    padding: 12,
    marginVertical: 4,
  },
  codeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  codeLanguage: {
    fontSize: 12,
    color: colors.primary,
    marginLeft: 6,
    fontWeight: '600',
  },
  codeContent: {
    fontSize: 13,
    color: '#d4d4d4',
    fontFamily: 'monospace',
    lineHeight: 18,
  },
  codeOutput: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  codeOutputLabel: {
    fontSize: 12,
    color: colors.success,
    fontWeight: '600',
    marginBottom: 4,
  },
  codeOutputText: {
    fontSize: 13,
    color: '#d4d4d4',
    fontFamily: 'monospace',
  },
  generatedImageContainer: {
    marginVertical: 4,
  },
  generatedImage: {
    width: 250,
    height: 250,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  imagePrompt: {
    fontSize: 12,
    color: colors.placeholder,
    marginTop: 6,
    fontStyle: 'italic',
  },
  analysisContainer: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 12,
    marginVertical: 4,
    borderLeftWidth: 3,
    borderLeftColor: colors.info,
  },
  analysisTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.info,
    marginBottom: 6,
  },
  analysisContent: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
});

export default MessageBubble;

