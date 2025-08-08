// app/(tabs)/index.tsx

import { useEffect, useRef } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, Text, KeyboardAvoidingView, Platform, SafeAreaView } from 'react-native';
import { useChatStore } from '@/hooks/chat-store';
import { useAgentStore } from '@/hooks/agent-store';
import { Message, ContentPart } from '@/types/chat';
import ChatInput from '@/components/ChatInput';
import MessageBubble from '@/components/MessageBubble';
import colors from '@/constants/colors';

// --- FINAL FIX: Header component is defined here directly as it does not exist in the components folder ---
const Header = ({ title }: { title: string }) => (
  <View style={styles.headerContainer}>
    <Text style={styles.headerTitle}>{title}</Text>
  </View>
);

export default function ChatScreen() {
  const { getCurrentSession, sendMessage, isLoading } = useChatStore();
  const currentSession = getCurrentSession();
  const { isProcessing, currentTask } = useAgentStore();
  
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (currentSession?.messages.length) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [currentSession?.messages.length, isProcessing]);

  const handleSendMessage = (userInput: string) => {
    if (!userInput.trim()) return;
    sendMessage([{ type: 'text', content: userInput }]);
  };

  const handleSendImage = (imageUri: string, base64: string) => {
    const imagePart: ContentPart = {
      type: 'image',
      content: `data:image/jpeg;base64,${base64}`,
      metadata: { url: imageUri, prompt: 'Analyze this image' }
    };
    sendMessage([imagePart]);
  };

  const handleSendDocument = (documentUri: string, fileName: string, mimeType: string) => {
    const docPart: ContentPart = {
      type: 'file',
      content: `File attached: ${fileName}`,
      metadata: { url: documentUri, fileName, fileType: mimeType }
    };
    sendMessage([docPart]);
  };

  const handleSendAudio = (audioUri: string, base64: string) => {
    const audioPart: ContentPart = {
      type: 'audio',
      content: `data:audio/m4a;base64,${base64}`,
      metadata: { url: audioUri }
    };
    sendMessage([audioPart]);
  };

  const renderMessage = ({ item }: { item: Message }) => <MessageBubble message={item} />;

  const renderFooter = () => {
    if (isProcessing) {
      return (
        <View style={styles.thinkingContainer}>
          <ActivityIndicator color={colors.primary} />
          <Text style={styles.thinkingText}>{currentTask || 'جاري التفكير...'}</Text>
        </View>
      );
    }
    if (isLoading) {
        return (
            <View style={styles.thinkingContainer}>
              <ActivityIndicator color={colors.primary} />
              <Text style={styles.thinkingText}>جاري تحميل المحادثات...</Text>
            </View>
          );
    }
    return null;
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title={currentSession?.title || 'محادثة جديدة'} />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={100}
      >
        <FlatList
          ref={flatListRef}
          data={currentSession?.messages || []}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListFooterComponent={renderFooter}
        />
        <ChatInput
          onSendMessage={handleSendMessage}
          onSendImage={handleSendImage}
          onSendDocument={handleSendDocument}
          onSendAudio={handleSendAudio}
          placeholder="أرسل هدفاً للوكيل..."
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerContainer: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    alignItems: 'center',
    backgroundColor: colors.card,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  listContent: {
    padding: 10,
  },
  thinkingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    marginHorizontal: 20,
    backgroundColor: colors.card,
    borderRadius: 12,
    alignSelf: 'center',
    marginBottom: 10,
  },
  thinkingText: {
    marginLeft: 10,
    color: colors.text,
    fontSize: 14,
  },
});
