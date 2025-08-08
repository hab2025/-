// hooks/chat-store.ts

import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { ChatSession, Message, ContentPart } from '@/types/chat';
import { useAgentStore } from './agent-store'; // This remains correct

interface ChatState {
  sessions: ChatSession[];
  currentSessionId: string | null;
  isLoading: boolean;
  loadSessions: () => Promise<void>;
  createNewSession: (title?: string) => Promise<string>;
  deleteSession: (sessionId: string) => void;
  selectSession: (sessionId: string) => void;
  getCurrentSession: () => ChatSession | null;
  sendMessage: (contentParts: ContentPart[]) => Promise<void>;
  clearAllSessions: () => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      sessions: [],
      currentSessionId: null,
      isLoading: true,

      loadSessions: async () => {
        // This function is now called from the layout to ensure isLoading is set to false
        set({ isLoading: false });
      },

      createNewSession: async (title?: string) => {
        const newSession: ChatSession = {
          id: Date.now().toString(),
          title: title || 'محادثة جديدة',
          messages: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
          activeAgents: ['general'],
        };
        const updatedSessions = [newSession, ...get().sessions];
        set({ sessions: updatedSessions, currentSessionId: newSession.id });
        return newSession.id;
      },

      deleteSession: (sessionId: string) => {
        const updatedSessions = get().sessions.filter(s => s.id !== sessionId);
        let newCurrentSessionId = get().currentSessionId;
        if (newCurrentSessionId === sessionId) {
          newCurrentSessionId = updatedSessions.length > 0 ? updatedSessions[0].id : null;
        }
        set({ sessions: updatedSessions, currentSessionId: newCurrentSessionId });
      },

      selectSession: (sessionId: string) => {
        set({ currentSessionId: sessionId });
      },

      getCurrentSession: () => {
        const { sessions, currentSessionId } = get();
        return sessions.find(s => s.id === currentSessionId) || null;
      },

      sendMessage: async (contentParts: ContentPart[]) => {
        let sessionId = get().currentSessionId;
        if (!sessionId) {
          sessionId = await get().createNewSession();
        }

        const userMessage: Message = {
          id: Date.now().toString(),
          role: 'user',
          content: contentParts,
          timestamp: Date.now(),
        };

        const sessionsAfterUserMessage = get().sessions.map(s =>
          s.id === sessionId
            ? { ...s, messages: [...s.messages, userMessage], updatedAt: Date.now() }
            : s
        );
        set({ sessions: sessionsAfterUserMessage });

        const thinkingMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: [], // Empty content initially
          timestamp: Date.now(),
          isThinking: true,
        };

        const sessionsAfterThinkingMessage = sessionsAfterUserMessage.map(s =>
            s.id === sessionId
              ? { ...s, messages: [...s.messages, thinkingMessage], updatedAt: Date.now() }
              : s
        );
        set({ sessions: sessionsAfterThinkingMessage });

        const query = contentParts.find(p => p.type === 'text')?.content || 'تحليل المرفق';
        
        // --- START OF THE FIX ---
        // 1. Call the new 'processGoal' function from the agent store.
        const finalResultText = await useAgentStore.getState().processGoal(query);

        // 2. Get the execution log from the agent store after processing.
        const finalLog = useAgentStore.getState().executionLog;
        
        // 3. Construct the final message content with the result and the log.
        const finalContent: ContentPart[] = [{ type: 'text', content: finalResultText }];

        if (finalLog.length > 0) {
          const logContent = finalLog.map(log => 
            `Step ${log.step}: [${log.tool}] ${log.task}\nResult: ${log.output.substring(0, 150)}...`
          ).join('\n\n');

          finalContent.push({
            type: 'code',
            content: logContent,
            metadata: { codeLanguage: 'bash', title: 'Agent Execution Log' }
          });
        }

        // 4. Update the "thinking" message with the final, complete content.
        set(state => ({
          sessions: state.sessions.map(s =>
            s.id === sessionId
              ? {
                  ...s,
                  messages: s.messages.map(msg =>
                    msg.id === thinkingMessage.id
                      ? { ...msg, content: finalContent, isThinking: false }
                      : msg
                  ),
                  updatedAt: Date.now(),
                }
              : s
          ),
        }));
        // --- END OF THE FIX ---
      },

      clearAllSessions: () => {
        set({ sessions: [], currentSessionId: null });
      },
    }),
    {
      name: 'chat-sessions-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
