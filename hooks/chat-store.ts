import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect } from 'react';
import { ChatSession, Message, ContentPart, AgentType } from '@/types/chat';
import { useAgent } from './agent-store';

export const [ChatContext, useChat] = createContextHook(() => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { processWithAgent, selectBestAgent } = useAgent();

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const storedSessions = await AsyncStorage.getItem('chatSessions');
      if (storedSessions) {
        const parsedSessions = JSON.parse(storedSessions) as ChatSession[];
        setSessions(parsedSessions);
        
        // Set the most recent session as current
        if (parsedSessions.length > 0) {
          const mostRecent = parsedSessions.reduce((prev, current) => 
            prev.updatedAt > current.updatedAt ? prev : current
          );
          setCurrentSessionId(mostRecent.id);
        }
      }
    } catch (error) {
      console.error('Failed to load chat sessions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSessions = async (updatedSessions: ChatSession[]) => {
    try {
      await AsyncStorage.setItem('chatSessions', JSON.stringify(updatedSessions));
      setSessions(updatedSessions);
    } catch (error) {
      console.error('Failed to save chat sessions:', error);
    }
  };

  const createNewSession = async (title?: string): Promise<string> => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: title || 'محادثة جديدة',
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      activeAgents: ['general'],
    };

    const updatedSessions = [newSession, ...sessions];
    await saveSessions(updatedSessions);
    setCurrentSessionId(newSession.id);
    return newSession.id;
  };

  const deleteSession = async (sessionId: string) => {
    const updatedSessions = sessions.filter(s => s.id !== sessionId);
    await saveSessions(updatedSessions);
    
    if (currentSessionId === sessionId) {
      if (updatedSessions.length > 0) {
        setCurrentSessionId(updatedSessions[0].id);
      } else {
        setCurrentSessionId(null);
      }
    }
  };

  const getCurrentSession = (): ChatSession | null => {
    return sessions.find(s => s.id === currentSessionId) || null;
  };

  const updateSessionTitle = async (sessionId: string, title: string) => {
    const updatedSessions = sessions.map(session =>
      session.id === sessionId
        ? { ...session, title, updatedAt: Date.now() }
        : session
    );
    await saveSessions(updatedSessions);
  };

  const addMessage = async (sessionId: string, message: Message) => {
    const updatedSessions = sessions.map(session =>
      session.id === sessionId
        ? {
            ...session,
            messages: [...session.messages, message],
            updatedAt: Date.now(),
          }
        : session
    );
    await saveSessions(updatedSessions);
  };

  const updateMessage = async (sessionId: string, messageId: string, updates: Partial<Message>) => {
    const updatedSessions = sessions.map(session =>
      session.id === sessionId
        ? {
            ...session,
            messages: session.messages.map(msg =>
              msg.id === messageId ? { ...msg, ...updates } : msg
            ),
            updatedAt: Date.now(),
          }
        : session
    );
    await saveSessions(updatedSessions);
  };

  const sendMessage = async (content: string, attachments?: any[]) => {
    if (!currentSessionId) {
      await createNewSession();
    }

    const session = getCurrentSession();
    if (!session) return;

    // Create user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: [{ type: 'text', content }],
      timestamp: Date.now(),
    };

    // Add attachments if any
    if (attachments && attachments.length > 0) {
      attachments.forEach(attachment => {
        userMessage.content.push({
          type: attachment.type,
          content: attachment.content,
          metadata: attachment.metadata,
        });
      });
    }

    await addMessage(session.id, userMessage);

    // Auto-generate title for new sessions
    if (session.messages.length === 0) {
      const title = content.length > 30 ? content.substring(0, 30) + '...' : content;
      await updateSessionTitle(session.id, title);
    }

    // Create thinking message
    const thinkingMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: [{ type: 'text', content: '' }],
      timestamp: Date.now(),
      isThinking: true,
    };

    await addMessage(session.id, thinkingMessage);

    try {
      // Select best agent and process
      const bestAgent = await selectBestAgent(content, session.messages);
      const result = await processWithAgent(bestAgent, content, {
        sessionId: session.id,
        previousMessages: session.messages,
      });

      // Update thinking message with result
      if (result.success) {
        const responseContent: ContentPart[] = [];

        // Add main response
        if (result.data?.response) {
          responseContent.push({
            type: 'text',
            content: result.data.response,
          });
        }

        // Add search results if available
        if (result.data?.searchResults) {
          responseContent.push({
            type: 'web_search',
            content: 'نتائج البحث:',
            metadata: {
              searchResults: result.data.searchResults,
              searchQuery: result.metadata?.searchQuery,
            },
          });
        }

        // Add generated image if available
        if (result.data?.imageUrl) {
          responseContent.push({
            type: 'generated_image',
            content: result.data.imageUrl,
            metadata: {
              prompt: result.data.prompt,
            },
          });
        }

        // Add code execution result if available
        if (result.metadata?.executionType === 'calculation') {
          responseContent.push({
            type: 'code_execution',
            content: result.data?.response || '',
            metadata: {
              executionTime: Date.now() - thinkingMessage.timestamp,
            },
          });
        }

        await updateMessage(session.id, thinkingMessage.id, {
          content: responseContent.length > 0 ? responseContent : [{ type: 'text', content: result.data?.response || 'تم المعالجة بنجاح' }],
          agentType: bestAgent,
          isThinking: false,
        });
      } else {
        await updateMessage(session.id, thinkingMessage.id, {
          content: [{ type: 'text', content: result.error || 'حدث خطأ في المعالجة' }],
          isThinking: false,
        });
      }
    } catch (error) {
      console.error('Error processing message:', error);
      await updateMessage(session.id, thinkingMessage.id, {
        content: [{ type: 'text', content: 'عذراً، حدث خطأ في معالجة رسالتك. يرجى المحاولة مرة أخرى.' }],
        isThinking: false,
      });
    }
  };

  const sendImageMessage = async (imageUri: string, base64: string, description?: string) => {
    if (!currentSessionId) {
      await createNewSession();
    }

    const session = getCurrentSession();
    if (!session) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: [
        {
          type: 'image',
          content: imageUri,
          metadata: {
            description: description || 'صورة مرفقة',
          },
        },
      ],
      timestamp: Date.now(),
    };

    await addMessage(session.id, userMessage);

    // Process image with appropriate agent
    const thinkingMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: [{ type: 'text', content: '' }],
      timestamp: Date.now(),
      isThinking: true,
    };

    await addMessage(session.id, thinkingMessage);

    try {
      const result = await processWithAgent('document_analyzer', 'تحليل الصورة المرفقة', {
        imageData: base64,
        sessionId: session.id,
      });

      await updateMessage(session.id, thinkingMessage.id, {
        content: [
          {
            type: 'analysis',
            content: result.data?.response || 'تم تحليل الصورة',
            metadata: {
              analysisType: 'image',
            },
          },
        ],
        agentType: 'document_analyzer',
        isThinking: false,
      });
    } catch (error) {
      await updateMessage(session.id, thinkingMessage.id, {
        content: [{ type: 'text', content: 'عذراً، فشل في تحليل الصورة' }],
        isThinking: false,
      });
    }
  };

  const sendDocumentMessage = async (documentUri: string, fileName: string, mimeType: string) => {
    if (!currentSessionId) {
      await createNewSession();
    }

    const session = getCurrentSession();
    if (!session) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: [
        {
          type: 'file',
          content: documentUri,
          metadata: {
            fileName,
            mimeType,
          },
        },
      ],
      timestamp: Date.now(),
    };

    await addMessage(session.id, userMessage);

    // Process document
    const thinkingMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: [{ type: 'text', content: '' }],
      timestamp: Date.now(),
      isThinking: true,
    };

    await addMessage(session.id, thinkingMessage);

    try {
      const result = await processWithAgent('file_analyzer', `تحليل الملف: ${fileName}`, {
        documentUri,
        fileName,
        mimeType,
        sessionId: session.id,
      });

      await updateMessage(session.id, thinkingMessage.id, {
        content: [
          {
            type: 'analysis',
            content: result.data?.response || 'تم تحليل الملف',
            metadata: {
              analysisType: 'document',
              fileName,
            },
          },
        ],
        agentType: 'file_analyzer',
        isThinking: false,
      });
    } catch (error) {
      await updateMessage(session.id, thinkingMessage.id, {
        content: [{ type: 'text', content: 'عذراً، فشل في تحليل الملف' }],
        isThinking: false,
      });
    }
  };

  const sendAudioMessage = async (audioUri: string, base64: string) => {
    if (!currentSessionId) {
      await createNewSession();
    }

    const session = getCurrentSession();
    if (!session) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: [
        {
          type: 'audio',
          content: audioUri,
          metadata: {
            description: 'رسالة صوتية',
          },
        },
      ],
      timestamp: Date.now(),
    };

    await addMessage(session.id, userMessage);

    // Process audio (transcription)
    const thinkingMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: [{ type: 'text', content: '' }],
      timestamp: Date.now(),
      isThinking: true,
    };

    await addMessage(session.id, thinkingMessage);

    try {
      // For now, simulate audio transcription
      const transcriptionResult = 'عذراً، خدمة تحويل الصوت إلى نص غير متاحة حالياً. يرجى كتابة رسالتك نصياً.';
      
      await updateMessage(session.id, thinkingMessage.id, {
        content: [{ type: 'text', content: transcriptionResult }],
        isThinking: false,
      });
    } catch (error) {
      await updateMessage(session.id, thinkingMessage.id, {
        content: [{ type: 'text', content: 'عذراً، فشل في معالجة الرسالة الصوتية' }],
        isThinking: false,
      });
    }
  };

  const clearAllSessions = async () => {
    await AsyncStorage.removeItem('chatSessions');
    setSessions([]);
    setCurrentSessionId(null);
  };

  return {
    sessions,
    currentSessionId,
    isLoading,
    getCurrentSession,
    createNewSession,
    deleteSession,
    setCurrentSessionId,
    updateSessionTitle,
    sendMessage,
    sendImageMessage,
    sendDocumentMessage,
    sendAudioMessage,
    clearAllSessions,
  };
});

