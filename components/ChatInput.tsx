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
  placeholder = 'اكتب رسالتك هنا...',
}) => {
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
      Alert.alert('إذن مطلوب', 'يرجى منح إذن الوصول إلى المعرض لاختيار صورة.');
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
      Alert.alert('إذن مطلوب', 'يرجى منح إذن الوصول إلى الكاميرا لالتقاط صورة.');
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
        Alert.alert('إذن مطلوب', 'يرجى منح إذن الوصول إلى الميكروفون للتسجيل.');
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
      Alert.alert('خطأ في التسجيل', 'فشل في بدء التسجيل. يرجى المحاولة مرة أخرى.');
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
      Alert.alert('خطأ في التسجيل', 'فشل في إيقاف التسجيل. يرجى المحاولة مرة أخرى.');
    } finally {
      setRecording(null);
    }
  };

  const showAttachmentOptions = () => {
    Alert.alert(
      'إرفاق ملف',
      'اختر نوع المرفق',
      [
        { text: 'صورة من المعرض', onPress: handlePickImage },
        { text: 'التقاط صورة', onPress: handleTakePhoto },
        { text: 'ملف', onPress: handlePickDocument },
        { text: 'إلغاء', style: 'cancel' },
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

