import React, { useState, useRef } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import { Send, Plus, Mic, Image as ImageIcon, FileText, Camera } from 'lucide-react-native';
import colors from '@/constants/colors';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Audio } from 'expo-av';
import { useLanguage } from '@/hooks/language-store';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onSendImage: (imageUri: string, base64: string) => void;
  onSendDocument: (documentUri: string, fileName: string, mimeType: string) => void;
  onSendAudio: (audioUri: string, base64: string) => void;
  placeholder?: string;
}

const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  onSendImage,
  onSendDocument,
  onSendAudio,
  placeholder,
}) => {
  const { t } = useLanguage();
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const inputRef = useRef<TextInput>(null);

  const handleSend = () => {
    if (inputText.trim()) {
      onSendMessage(inputText.trim());
      setInputText('');
      inputRef.current?.blur();
    }
  };

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(t('chat.permissions.mediaLibrary.title', 'Permission required'), t('chat.permissions.mediaLibrary.message', 'Please grant media library permissions to pick an image.'));
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
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
        onSendImage(imageUri, base64Image);
      }
    }
  };

  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(t('chat.permissions.camera.title', 'Permission required'), t('chat.permissions.camera.message', 'Please grant camera permissions to take a photo.'));
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
      base64: true,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const imageUri = result.assets[0].uri;
      const base64Image = result.assets[0].base64;
      if (base64Image) {
        onSendImage(imageUri, base64Image);
      }
    }
  };

  const handlePickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: '*/*',
      copyToCacheDirectory: true,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const docUri = result.assets[0].uri;
      const docName = result.assets[0].name;
      const docMimeType = result.assets[0].mimeType;
      if (docName && docMimeType) {
        onSendDocument(docUri, docName, docMimeType);
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

      const { recording } = await Audio.Recording.createAsync({
        android: {
          extension: '.m4a',
          outputFormat: Audio.RecordingOptions.AndroidOutputFormat.MPEG_4,
          audioEncoder: Audio.RecordingOptions.AndroidAudioEncoder.AAC,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
        },
        ios: {
          extension: '.m4a',
          audioQuality: Audio.RecordingQuality.High,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
      });

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
      if (uri) {
        // Convert to base64 for transmission
        const response = await fetch(uri);
        const blob = await response.blob();
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64data = reader.result as string;
          const base64Audio = base64data.split(',')[1]; // Remove data:audio/m4a;base64, prefix
          onSendAudio(uri, base64Audio);
        };
        reader.readAsDataURL(blob);
      }
    } catch (err) {
      console.error('Failed to stop recording', err);
      Alert.alert(t('chat.errors.stopRecording.title', 'Recording Error'), t('chat.errors.stopRecording.message', 'Failed to stop recording. Please try again.'));
    } finally {
      setRecording(null);
    }
  };

  const showAttachmentOptions = () => {
    Alert.alert(
      t('chat.attachments.title', 'Attach a file'),
      t('chat.attachments.message', 'Choose the attachment type'),
      [
        { text: t('chat.attachments.gallery', 'Image from Gallery'), onPress: handlePickImage },
        { text: t('chat.attachments.camera', 'Take a photo'), onPress: handleTakePhoto },
        { text: t('chat.attachments.file', 'File'), onPress: handlePickDocument },
        { text: t('chat.attachments.cancel', 'Cancel'), style: 'cancel' },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.attachButton} onPress={showAttachmentOptions}>
        <Plus size={24} color={colors.placeholder} />
      </TouchableOpacity>

      <TextInput
        ref={inputRef}
        style={styles.textInput}
        placeholder={placeholder}
        placeholderTextColor={colors.placeholder}
        value={inputText}
        onChangeText={setInputText}
        multiline
        maxLength={4000}
        textAlignVertical="center"
      />

      {inputText.length > 0 ? (
        <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
          <Send size={20} color={colors.lightText} />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={[styles.micButton, isRecording && styles.recordingButton]}
          onPress={isRecording ? stopRecording : startRecording}
        >
          <Mic size={20} color={colors.lightText} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  attachButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    maxHeight: 120,
    minHeight: 40,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 10 : 8,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.background,
    textAlignVertical: 'center',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  micButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  recordingButton: {
    backgroundColor: colors.error,
  },
});

export default ChatInput;

