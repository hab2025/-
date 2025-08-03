import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Send, Plus, Mic, Image, Paperclip, Moon, Sun } from 'lucide-react-native';
import { useChat } from '@/hooks/chat-store';
import { useAgent } from '@/hooks/agent-store';
import { useLanguage } from '@/hooks/language-store';
import { useTheme } from '@/hooks/useTheme';
import MessageBubbleEnhanced from '@/components/MessageBubbleEnhanced';
import TypingIndicator from '@/components/chat/TypingIndicator';
import ChatSessionList from '@/components/chat/ChatSessionList';
import AnimatedButton from '@/components/ui/AnimatedButton';
import FloatingActionButton from '@/components/ui/FloatingActionButton';
import GradientBackground from '@/components/ui/GradientBackground';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const { width, height } = Dimensions.get('window');

export default function ChatScreen() {
  const { theme, isDark, toggleTheme } = useTheme();
  const { t } = useLanguage();
  const { 
    currentSession, 
    sessions, 
    sendMessage, 
    createNewSession, 
    switchToSession,
    deleteSession,
    isLoading 
  } = useChat();
  
  const { 
    currentAgent, 
    isProcessing, 
    currentTask,
    processMessage 
  } = useAgent();

  const [inputText, setInputText] = useState('');
  const [showSessions, setShowSessions] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  
  const flatListRef = useRef<FlatList>(null);
  const inputRef = useRef<TextInput>(null);
  const slideAnim = useRef(new Animated.Value(-width)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    // Entry animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    if (showSessions) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: -width,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [showSessions]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || isProcessing) return;

    const messageText = inputText.trim();
    setInputText('');
    
    try {
      await sendMessage(messageText);
      await processMessage(messageText);
      
      // Scroll to bottom after sending
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleNewChat = () => {
    createNewSession();
    setShowSessions(false);
  };

  const handleSessionSelect = (sessionId: string) => {
    switchToSession(sessionId);
    setShowSessions(false);
  };

  const handleSessionDelete = (sessionId: string) => {
    deleteSession(sessionId);
  };

  const handleVoiceRecord = () => {
    setIsRecording(!isRecording);
    // TODO: Implement voice recording
  };

  const handleImagePicker = () => {
    // TODO: Implement image picker
  };

  const handleFilePicker = () => {
    // TODO: Implement file picker
  };

  const renderMessage = ({ item, index }: { item: any; index: number }) => (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [
          {
            translateY: fadeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [50, 0],
            }),
          },
        ],
      }}
    >
      <MessageBubbleEnhanced
        message={item}
        onDelete={(messageId) => {
          // TODO: Implement message deletion
        }}
        onEdit={(messageId, newContent) => {
          // TODO: Implement message editing
        }}
        onRegenerate={(messageId) => {
          // TODO: Implement message regeneration
        }}
        onFeedback={(messageId, feedback) => {
          // TODO: Implement feedback system
        }}
      />
    </Animated.View>
  );

  const renderEmptyState = () => (
    <Animated.View 
      style={[
        styles.emptyState,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <View style={styles.welcomeContainer}>
        <Text style={[styles.welcomeTitle, { color: theme.colors.text }]}>
          {t('chat.welcome', 'مرحباً بك في المساعد الذكي')}
        </Text>
        <Text style={[styles.welcomeSubtitle, { color: theme.colors.textSecondary }]}>
          {t('chat.welcomeMessage', 'كيف يمكنني مساعدتك اليوم؟')}
        </Text>
        
        <View style={styles.suggestionsContainer}>
          {[
            '🔍 ابحث عن معلومات حديثة',
            '💡 اطرح سؤالاً',
            '📝 اكتب نصاً إبداعياً',
            '🧮 حل مسألة رياضية',
          ].map((suggestion, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.suggestionCard,
                { 
                  backgroundColor: theme.colors.card,
                  borderColor: theme.colors.border,
                },
              ]}
              onPress={() => setInputText(suggestion.substring(2))}
            >
              <Text style={[styles.suggestionText, { color: theme.colors.text }]}>
                {suggestion}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </Animated.View>
  );

  const messages = currentSession?.messages || [];

  return (
    <GradientBackground variant="background" animated={true}>
      <SafeAreaView style={styles.container}>
        <StatusBar 
          barStyle={isDark ? 'light-content' : 'dark-content'} 
          backgroundColor="transparent" 
          translucent 
        />
        
        {/* Header */}
        <Animated.View 
          style={[
            styles.header,
            { 
              backgroundColor: theme.colors.surface + '95',
              borderBottomColor: theme.colors.border,
              opacity: fadeAnim,
            },
          ]}
        >
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setShowSessions(true)}
          >
            <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
              {currentSession?.title || t('chat.newChat', 'محادثة جديدة')}
            </Text>
          </TouchableOpacity>
          
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={[styles.iconButton, { backgroundColor: theme.colors.card }]}
              onPress={toggleTheme}
            >
              {isDark ? (
                <Sun size={20} color={theme.colors.text} />
              ) : (
                <Moon size={20} color={theme.colors.text} />
              )}
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Messages List */}
        <KeyboardAvoidingView 
          style={styles.messagesContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          {messages.length === 0 ? (
            renderEmptyState()
          ) : (
            <FlatList
              ref={flatListRef}
              data={messages}
              renderItem={renderMessage}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.messagesList}
              showsVerticalScrollIndicator={false}
              onContentSizeChange={() => {
                flatListRef.current?.scrollToEnd({ animated: true });
              }}
            />
          )}
          
          {/* Typing Indicator */}
          {isProcessing && (
            <TypingIndicator
              agentName={currentAgent?.name || 'المساعد'}
              currentTask={currentTask}
            />
          )}
        </KeyboardAvoidingView>

        {/* Input Area */}
        <Animated.View 
          style={[
            styles.inputContainer,
            { 
              backgroundColor: theme.colors.surface + '95',
              borderTopColor: theme.colors.border,
              opacity: fadeAnim,
            },
          ]}
        >
          <View style={styles.inputRow}>
            {/* Attachment Buttons */}
            <View style={styles.attachmentButtons}>
              <TouchableOpacity
                style={[styles.attachmentButton, { backgroundColor: theme.colors.card }]}
                onPress={handleFilePicker}
              >
                <Paperclip size={20} color={theme.colors.textSecondary} />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.attachmentButton, { backgroundColor: theme.colors.card }]}
                onPress={handleImagePicker}
              >
                <Image size={20} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Text Input */}
            <View style={styles.inputWrapper}>
              <TextInput
                ref={inputRef}
                style={[
                  styles.textInput,
                  { 
                    backgroundColor: theme.colors.card,
                    color: theme.colors.text,
                    borderColor: theme.colors.border,
                  },
                ]}
                placeholder={t('chat.placeholder', 'اكتب رسالتك هنا...')}
                placeholderTextColor={theme.colors.placeholder}
                value={inputText}
                onChangeText={setInputText}
                multiline
                maxLength={1000}
                textAlignVertical="center"
                returnKeyType="send"
                onSubmitEditing={handleSendMessage}
              />
            </View>

            {/* Send/Voice Button */}
            <View style={styles.sendButtonContainer}>
              {inputText.trim() ? (
                <AnimatedButton
                  title=""
                  onPress={handleSendMessage}
                  variant="primary"
                  size="small"
                  disabled={isProcessing}
                  style={styles.sendButton}
                  animationType="scale"
                  icon={
                    isProcessing ? (
                      <LoadingSpinner size="small" variant="dots" />
                    ) : (
                      <Send size={20} color={theme.colors.textInverse} />
                    )
                  }
                />
              ) : (
                <TouchableOpacity
                  style={[
                    styles.voiceButton,
                    { 
                      backgroundColor: isRecording ? theme.colors.error : theme.colors.secondary,
                    },
                  ]}
                  onPress={handleVoiceRecord}
                >
                  <Mic size={20} color={theme.colors.textInverse} />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </Animated.View>

        {/* Floating Action Button */}
        <FloatingActionButton
          onPress={handleNewChat}
          icon={<Plus size={24} color={theme.colors.textInverse} />}
          position="bottom-left"
          animated={true}
          pulseAnimation={messages.length === 0}
        />

        {/* Sessions Sidebar */}
        <Animated.View
          style={[
            styles.sessionsSidebar,
            {
              backgroundColor: theme.colors.surface,
              transform: [{ translateX: slideAnim }],
            },
          ]}
        >
          <ChatSessionList
            sessions={sessions}
            currentSessionId={currentSession?.id}
            onSessionSelect={handleSessionSelect}
            onSessionDelete={handleSessionDelete}
            onNewSession={handleNewChat}
            onClose={() => setShowSessions(false)}
          />
        </Animated.View>

        {/* Overlay */}
        {showSessions && (
          <TouchableOpacity
            style={styles.overlay}
            onPress={() => setShowSessions(false)}
            activeOpacity={1}
          />
        )}
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    backdropFilter: 'blur(10px)',
  },
  headerButton: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesList: {
    paddingVertical: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  welcomeContainer: {
    alignItems: 'center',
    maxWidth: 300,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  suggestionsContainer: {
    width: '100%',
  },
  suggestionCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  suggestionText: {
    fontSize: 14,
    textAlign: 'center',
  },
  inputContainer: {
    borderTopWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backdropFilter: 'blur(10px)',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  attachmentButtons: {
    flexDirection: 'row',
    marginRight: 8,
  },
  attachmentButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
  },
  inputWrapper: {
    flex: 1,
    marginRight: 8,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    maxHeight: 100,
    textAlign: 'right',
  },
  sendButtonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    minHeight: 44,
  },
  voiceButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sessionsSidebar: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: width * 0.85,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 999,
  },
});

