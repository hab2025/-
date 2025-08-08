// hooks/computer-agent-store.ts - النسخة النهائية مع تصحيح مسار الـ URL

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

// -------------------------------------------------------------------
// !! تم تصحيح هذا السطر !!
// تأكد من عدم وجود شرطة مائلة (/) في نهاية العنوان
const SERVER_URL = 'https://curly-space-zebra-wrgg6gqp4566h5975-3001.app.github.dev'; // <-- ضع رابطك الصحيح هنا
// -------------------------------------------------------------------

type ComputerAction = { id: string; type: 'command'; payload: any; timestamp: number; status: 'completed' | 'failed'; result?: any; };
type SandboxSession = { id: string; status: 'active' | 'inactive' | 'error'; createdAt: number; lastActivity: number; actionsCount: number; };
type ComputerAgentState = {
  session: SandboxSession | null;
  actions: ComputerAction[];
  isInitializing: boolean;
  isProcessing: boolean;
  currentTask: string | null;
  lastError: string | null;
  initializeSandbox: ( ) => Promise<boolean>;
  destroySandbox: () => Promise<void>;
  executeTask: (task: string) => Promise<string>;
  runCommand: (command: string) => Promise<string>;
  clearActions: () => void;
};

export const useComputerAgent = create<ComputerAgentState>()(
  devtools(
    (set, get) => ({
      session: null,
      actions: [],
      isInitializing: false,
      isProcessing: false,
      currentTask: null,
      lastError: null,

      initializeSandbox: async (): Promise<boolean> => {
        console.log(`[App] Attempting to connect to server at: ${SERVER_URL}`);
        set({ isInitializing: true, lastError: null, currentTask: 'جاري إنشاء بيئة العمل...' });
        try {
          // المسار هنا سيتم بناؤه بشكل صحيح: ...dev/create-sandbox
          const response = await fetch(`${SERVER_URL}/create-sandbox`, { method: 'POST' });
          
          if (!response.ok) {
            const errorText = await response.text();
            console.error('[App] Server responded with an error:', response.status, errorText);
            throw new Error(`فشل الاتصال بالخادم: ${response.status}`);
          }
          
          const data = await response.json();
          const newSession: SandboxSession = {
              id: data.sandboxId,
              status: 'active',
              createdAt: Date.now(),
              lastActivity: Date.now(),
              actionsCount: 0
          };
          set({ session: newSession, isInitializing: false, currentTask: '✅ تم إنشاء بيئة العمل بنجاح!' });
          console.log('[App] Sandbox created successfully via server.');
          return true;

        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : 'فشل غير معروف';
          console.error('[App] Error initializing sandbox:', error);
          set({ isInitializing: false, lastError: `فشل إنشاء البيئة: ${errorMsg}`, currentTask: null });
          return false;
        }
      },

      destroySandbox: async (): Promise<void> => {
        const { session } = get();
        if (session) {
            try {
                await fetch(`${SERVER_URL}/destroy-sandbox`, { method: 'POST' });
            } catch (error) {
                console.error('[App] Failed to destroy sandbox via server:', error);
            }
        }
        set({ session: null, actions: [], currentTask: 'تم إغلاق الجلسة.' });
      },

      runCommand: async (command: string): Promise<string> => {
        const { session } = get();
        if (!session) throw new Error('No active sandbox');
        const response = await fetch(`${SERVER_URL}/execute-command`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ command }),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'فشل تنفيذ الأمر على الخادم');
        }
        const data = await response.json();
        return data.logs.stdout || data.logs.stderr || '(No output from command)';
      },

      executeTask: async (task: string): Promise<string> => {
          set({ isProcessing: true, currentTask: `جاري تنفيذ: ${task}`, lastError: null });
          try {
              const result = await get().runCommand(task);
              const action: ComputerAction = { id: Date.now().toString(), type: 'command', payload: task, timestamp: Date.now(), status: 'completed', result };
              set(state => ({ actions: [action, ...state.actions], isProcessing: false, currentTask: null }));
              return result;
          } catch (error) {
              const errorMsg = error instanceof Error ? error.message : 'فشل التنفيذ';
              const action: ComputerAction = { id: Date.now().toString(), type: 'command', payload: task, timestamp: Date.now(), status: 'failed', result: errorMsg };
              set(state => ({ actions: [action, ...state.actions], isProcessing: false, lastError: errorMsg, currentTask: null }));
              throw new Error(errorMsg);
          }
      },
      
      clearActions: () => {
        set({ actions: [] });
      },
    }),
    { name: 'computer-agent-store' }
  )
);

// --- تصدير الـ Hooks (هذا الجزء صحيح ومؤكد) ---
// تم تبسيط هذا الجزء ليتوافق مع واجهة المستخدم
export const useComputerAgentState = () => useComputerAgent(state => state);
