import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  Keyboard,
} from 'react-native';
import { Send, Plus, Mic, Brain, MessageSquare } from 'lucide-react-native';
import { useHeaderHeight } from '@react-navigation/elements';
import { useAuth } from '@/hooks/auth-store';
import { useChat } from '@/hooks/chat-store';
import { useAgent } from '@/hooks/agent-store';
import { useLanguage } from '@/hooks/language-store';
import MessageBubble from '@/components/MessageBubble';
import ChatSessionItem from '@/components/ChatSessionItem';
import colors from '@/constants/colors';
import { AgentType, ChatSession } from '@/types/chat';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { Audio } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const RECORDING_OPTIONS_PRESET_HIGH_QUALITY = {
  android: {
    extension: '.m4a',
    outputFormat: Audio.AndroidOutputFormat.MPEG_4,
    audioEncoder: Audio.AndroidAudioEncoder.AAC,
    sampleRate: 44100,
    numberOfChannels: 2,
    bitRate: 128000,
  },
  ios: {
    extension: '.m4a',
    audioQuality: Audio.IOSAudioQuality.HIGH,
    sampleRate: 44100,
    numberOfChannels: 2,
    bitRate: 128000,
    linearPCMBitDepth: 16,
    linearPCMIsBigEndian: false,
    linearPCMIsFloat: false,
  },
};

export default function ChatScreen() {
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [showAgentPicker, setShowAgentPicker] = useState(false);
  const [showSessionPicker, setShowSessionPicker] = useState(false);

  const { user } = useAuth();
  const { t } = useLanguage();
  const { 
    currentSession,
    sessions,
    startNewSession,
    selectSession,
    deleteSession,
    sendMessage,
    sendImageMessage,
    sendDocumentMessage,
    sendAudioMessage,
  } = useChat();
  const { 
    activeAgents,
    activateAgent,
    deactivateAgent,
    getAllAgents,
    isProcessing,
    currentTask,
  } = useAgent();

  const scrollViewRef = useRef<ScrollView>(null);
  const inputRef = useRef<TextInput>(null);

  const allAgents = getAllAgents();

  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [currentSession?.messages]);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }
    );
    return () => {
      keyboardDidShowListener.remove();
    };
  }, []);

  const handleSendMessage = async () => {
    if (inputText.trim() === '') return;
    sendMessage(inputText.trim());
    setInputText('');
    inputRef.current?.blur();
  };

  const handleNewChat = () => {
    startNewSession();
    setInputText('');
    setShowSessionPicker(false);
  };

  const handleSelectSession = (sessionId: string) => {
    selectSession(sessionId);
    setShowSessionPicker(false);
  };

  const handleDeleteSession = (sessionId: string) => {
    Alert.alert(
      t('chat.deleteSession.title', 'Delete Conversation'),
      t('chat.deleteSession.message', 'Are you sure you want to delete this conversation?'),
      [
        { text: t('chat.deleteSession.cancel', 'Cancel'), style: 'cancel' },
        { text: t('chat.deleteSession.delete', 'Delete'), onPress: () => deleteSession(sessionId), style: 'destructive' },
      ]
    );
  };

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(t('chat.permissions.mediaLibrary.title', 'Permission required'), t('chat.permissions.mediaLibrary.message', 'Please grant media library permissions to pick an image.'));
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
      base64: true,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const imageUri = result.assets[0].uri;
      const base64Image = result.assets[0].base64;
      if (base64Image) {
        sendImageMessage(imageUri, base64Image);
      }
    }
  };

  const handlePickDocument = async () => {
    let result = await DocumentPicker.getDocumentAsync({
      type: '*/*', // Allow all file types
      copyToCacheDirectory: true,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const docUri = result.assets[0].uri;
      const docName = result.assets[0].name;
      const docMimeType = result.assets[0].mimeType;

      try {
        const fileContent = await FileSystem.readAsStringAsync(docUri, { encoding: FileSystem.EncodingType.Base64 });
        if (docMimeType) {
          sendDocumentMessage(docUri, docName, docMimeType, fileContent);
        }
      } catch (error) {
        console.error('Error reading document:', error);
        Alert.alert(t('chat.errors.readDocument.title', 'Error'), t('chat.errors.readDocument.message', 'Could not read the selected document.'));
      }
    }
  };

  const startRecording = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(t('chat.permissions.microphone.title', 'Permission required'), t('chat.permissions.microphone.message', 'Please grant microphone permissions to record audio.'));
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      const { recording } = await Audio.Recording.createAsync(
        RECORDING_OPTIONS_PRESET_HIGH_QUALITY
      );
      setRecording(recording);
      setIsRecording(true);
    } catch (err) {
      console.error('Failed to start recording', err);
      Alert.alert(t('chat.errors.startRecording.title', 'Recording Error'), t('chat.errors.startRecording.message', 'Failed to start recording. Please try again.'));
    }
  };

  const stopRecording = async () => {
    setIsRecording(false);
    if (!recording) return;

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      if (!uri) {
        Alert.alert(t('chat.errors.getRecordingUri.title', 'Recording Error'), t('chat.errors.getRecordingUri.message', 'Failed to get recording URI.'));
        return;
      }

      const base64Audio = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
      sendAudioMessage(uri, base64Audio);
    } catch (err) {
      console.error('Failed to stop recording', err);
      Alert.alert(t('chat.errors.stopRecording.title', 'Recording Error'), t('chat.errors.stopRecording.message', 'Failed to stop recording. Please try again.'));
    } finally {
      setRecording(null);
    }
  };

  const handleAgentToggle = (agentType: AgentType) => {
    if (activeAgents.includes(agentType)) {
      deactivateAgent(agentType);
    } else {
      activateAgent(agentType);
    }
  };

  const renderAgentPicker = () => (
    <BlurView intensity={90} style={StyleSheet.absoluteFillObject}>
      <View style={styles.agentPickerContainer}>
        <ScrollView contentContainerStyle={styles.agentPickerContent}>
          <Text style={styles.agentPickerTitle}>{t('chat.agentPicker.title', 'Select Active Agents')}</Text>
          {allAgents.map((agent) => (
            <TouchableOpacity
              key={agent.type}
              style={styles.agentPickerItem}
              onPress={() => handleAgentToggle(agent.type)}
            >
              <Text style={styles.agentPickerEmoji}>{agent.icon}</Text>
              <Text style={styles.agentPickerName}>{t(agent.name, agent.name)}</Text>
              {activeAgents.includes(agent.type) && (
                <Text style={styles.agentPickerActive}>✓</Text>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
        <TouchableOpacity style={styles.closeButton} onPress={() => setShowAgentPicker(false)}>
          <Text style={styles.closeButtonText}>{t('chat.agentPicker.close', 'Close')}</Text>
        </TouchableOpacity>
      </View>
    </BlurView>
  );

  const renderSessionPicker = () => (
    <BlurView intensity={90} style={StyleSheet.absoluteFillObject}>
      <View style={styles.sessionPickerContainer}>
        <ScrollView contentContainerStyle={styles.sessionPickerContent}>
          <Text style={styles.sessionPickerTitle}>{t('chat.sessionPicker.title', 'My Conversations')}</Text>
          <TouchableOpacity style={styles.newChatButton} onPress={handleNewChat}>
            <Plus size={20} color={colors.primary} />
            <Text style={styles.newChatButtonText}>{t('chat.sessionPicker.newChat', 'New Conversation')}</Text>
          </TouchableOpacity>
          {sessions.map((session) => (
            <ChatSessionItem
              key={session.id}
              session={session}
              isActive={session.id === currentSession?.id}
              onPress={() => handleSelectSession(session.id)}
              onDelete={() => handleDeleteSession(session.id)}
            />
          ))}
        </ScrollView>
        <TouchableOpacity style={styles.closeButton} onPress={() => setShowSessionPicker(false)}>
          <Text style={styles.closeButtonText}>{t('chat.sessionPicker.close', 'Close')}</Text>
        </TouchableOpacity>
      </View>
    </BlurView>
  );

  const headerHeight = useHeaderHeight();

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={headerHeight}
    >
      <LinearGradient
        colors={[colors.background, colors.card]}
        style={styles.gradientBackground}
      />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setShowSessionPicker(true)} style={styles.headerButton}>
          <MessageSquare size={24} color={colors.text} />
          <Text style={styles.headerButtonText}>{t('chat.header.conversations', 'Conversations')}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{currentSession?.title || t('chat.newChat', 'New Chat')}</Text>
        <TouchableOpacity onPress={() => setShowAgentPicker(true)} style={styles.headerButton}>
          <Brain size={24} color={colors.text} />
          <Text style={styles.headerButtonText}>{t('chat.header.agents', 'Agents')}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContentContainer}
        showsVerticalScrollIndicator={false}
      >
        {currentSession?.messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        {isProcessing && currentTask && (
          <View style={styles.thinkingContainer}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={styles.thinkingText}>{t(currentTask.split(',')[0], currentTask.split(',')[0]).replace('{agent}', t(currentTask.split(',')[1], currentTask.split(',')[1]))}</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TouchableOpacity style={styles.attachButton} onPress={() => Alert.alert(t('chat.attachments.title', 'Attach a file'), t('chat.attachments.message', 'Choose the attachment type'), [
          { text: t('chat.attachments.gallery', 'Image from Gallery'), onPress: handlePickImage },
          { text: t('chat.attachments.file', 'File'), onPress: handlePickDocument },
        ])}>
          <Plus size={24} color={colors.placeholder} />
        </TouchableOpacity>

        <TextInput
          ref={inputRef}
          style={styles.textInput}
          placeholder={t('chat.placeholder', 'Type your message here...')}
          placeholderTextColor={colors.placeholder}
          value={inputText}
          onChangeText={setInputText}
          multiline
          scrollEnabled
          onFocus={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        />

        {inputText.length > 0 ? (
          <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
            <Send size={24} color={colors.lightText} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.micButton}
            onPress={isRecording ? stopRecording : startRecording}
          >
            {isRecording ? (
              <ActivityIndicator size="small" color={colors.lightText} />
            ) : (
              <Mic size={24} color={colors.lightText} />
            )}
          </TouchableOpacity>
        )}
      </View>

      {showAgentPicker && renderAgentPicker()}
      {showSessionPicker && renderSessionPicker()}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  gradientBackground: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 10,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  headerButtonText: {
    marginLeft: 4,
    color: colors.text,
    fontSize: 14,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 10,
  },
  messagesContentContainer: {
    paddingVertical: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.card,
  },
  attachButton: {
    padding: 8,
    marginRight: 5,
  },
  textInput: {
    flex: 1,
    maxHeight: 120,
    minHeight: 40,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingTop: 10,
    paddingBottom: 10,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.background,
  },
  sendButton: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  micButton: {
    backgroundColor: colors.secondary,
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  thinkingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 10,
    padding: 10,
    marginVertical: 5,
    maxWidth: '80%',
    alignSelf: 'flex-start',
  },
  thinkingText: {
    marginLeft: 10,
    color: colors.text,
    fontStyle: 'italic',
  },
  agentPickerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  agentPickerContent: {
    backgroundColor: colors.card,
    borderRadius: 15,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  agentPickerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: colors.text,
    textAlign: 'center',
  },
  agentPickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  agentPickerEmoji: {
    fontSize: 20,
    marginRight: 10,
  },
  agentPickerName: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
  },
  agentPickerActive: {
    fontSize: 18,
    color: colors.primary,
    fontWeight: 'bold',
  },
  closeButton: {
    marginTop: 20,
    padding: 12,
    backgroundColor: colors.primary,
    borderRadius: 10,
    alignSelf: 'center',
  },
  closeButtonText: {
    color: colors.lightText,
    fontSize: 16,
    fontWeight: 'bold',
  },
  sessionPickerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sessionPickerContent: {
    backgroundColor: colors.card,
    borderRadius: 15,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  sessionPickerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: colors.text,
    textAlign: 'center',
  },
  newChatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  newChatButtonText: {
    marginLeft: 10,
    color: colors.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

