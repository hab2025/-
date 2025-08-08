// hooks/agent-store.ts - النسخة النهائية المحسنة

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

// --- التكوين والثوابت ---
const API_CONFIG = {
  LLM_ENDPOINT: 'https://toolkit.rork.com/text/llm/',
  SEARCH_ENDPOINT: 'https://google.serper.dev/search',
  API_KEY: process.env.NEXT_PUBLIC_SERPER_API_KEY || 'c6a7cc38f076762ede0c3a95a134e528ba14ea0e', // سيتم نقلها لمتغيرات البيئة لاحقاً
  REQUEST_TIMEOUT: 30000, // 30 ثانية
  MIN_SEARCH_INTERVAL: 1000, // ثانية واحدة بين البحثات
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,
};

// --- أنواع البيانات ---
type Tool = 'web_search' | 'data_analysis' | 'content_writer' | 'general';

interface ExecutionLog {
  step: number;
  tool: Tool;
  task: string;
  output: string;
  timestamp: number;
  duration: number;
  success: boolean;
}

interface AgentState {
  // حالة المعالجة
  isProcessing: boolean;
  currentTask: string | null;
  progress: number;
  
  // البيانات
  executionLog: ExecutionLog[];
  lastError: string | null;
  
  // الوظائف
  processGoal: (goal: string) => Promise<string>;
  clearLog: () => void;
  resetState: () => void;
}

// --- مساعدات للشبكة والأخطاء ---
class NetworkHelper {
  static async fetchWithTimeout(url: string, options: RequestInit, timeout: number): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  static async retryOperation<T>(
    operation: () => Promise<T>,
    maxRetries: number = API_CONFIG.MAX_RETRIES,
    delay: number = API_CONFIG.RETRY_DELAY
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('خطأ غير معروف');
        
        if (attempt === maxRetries) break;
        
        // تأخير متزايد
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, attempt - 1)));
      }
    }
    
    throw lastError!;
  }
}

// --- خدمة LLM ---
class LLMService {
  static async makeRequest(messages: Array<{role: string; content: string}>): Promise<string> {
    return NetworkHelper.retryOperation(async () => {
      const response = await NetworkHelper.fetchWithTimeout(
        API_CONFIG.LLM_ENDPOINT,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages }),
        },
        API_CONFIG.REQUEST_TIMEOUT
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      return data.completion || 'لم يتم الحصول على رد';
    });
  }
}

// --- خدمة البحث ---
class SearchService {
  private static lastSearchTime = 0;

  static async search(query: string): Promise<string> {
    // Rate limiting
    const now = Date.now();
    const timeSinceLastSearch = now - this.lastSearchTime;
    if (timeSinceLastSearch < API_CONFIG.MIN_SEARCH_INTERVAL) {
      await new Promise(resolve => 
        setTimeout(resolve, API_CONFIG.MIN_SEARCH_INTERVAL - timeSinceLastSearch)
      );
    }

    this.lastSearchTime = Date.now();

    return NetworkHelper.retryOperation(async () => {
      if (!API_CONFIG.API_KEY || API_CONFIG.API_KEY.includes('your-api-key')) {
        throw new Error('مفتاح API للبحث غير مُعرّف');
      }

      const response = await NetworkHelper.fetchWithTimeout(
        API_CONFIG.SEARCH_ENDPOINT,
        {
          method: 'POST',
          headers: { 
            'X-API-KEY': API_CONFIG.API_KEY,
            'Content-Type': 'application/json' 
          },
          body: JSON.stringify({ 
            q: query,
            num: 5,
            gl: 'sa',
            hl: 'ar'
          }),
        },
        API_CONFIG.REQUEST_TIMEOUT
      );

      if (!response.ok) {
        throw new Error(`فشل البحث: HTTP ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.organic || data.organic.length === 0) {
        return `لم يتم العثور على نتائج مناسبة للبحث: "${query}"`;
      }

      const results = data.organic
        .slice(0, 3) // أفضل 3 نتائج فقط
        .map((item: any) => 
          `🔍 ${item.title}\n🔗 ${item.link}\n📝 ${item.snippet}`
        )
        .join('\n\n─────────────\n\n');
      
      return `نتائج البحث عن "${query}":\n\n${results}`;
    });
  }
}

// --- مدير المهام ---
class TaskManager {
  static validateGoal(goal: string): void {
    if (!goal || typeof goal !== 'string') {
      throw new Error('الهدف مطلوب');
    }
    
    const trimmedGoal = goal.trim();
    if (trimmedGoal.length < 5) {
      throw new Error('الهدف قصير جداً. يرجى كتابة هدف أكثر تفصيلاً');
    }
    
    if (trimmedGoal.length > 500) {
      throw new Error('الهدف طويل جداً. يرجى التلخيص');
    }
  }

  static async createPlan(goal: string): Promise<string[]> {
    this.validateGoal(goal);

    const prompt = `أنت خبير في تخطيط المهام. قسم الهدف التالي إلى خطوات واضحة ومتسلسلة.

استخدم الأدوات التالية:
- [web_search] للبحث عن معلومات حديثة
- [data_analysis] لتحليل المعلومات والبيانات  
- [content_writer] لكتابة التقارير والملخصات

الهدف: "${goal}"

اكتب 3-5 خطوات محددة وواضحة:`;

    const completion = await LLMService.makeRequest([
      {
        role: 'system',
        content: 'أنت مخطط خبير. اكتب خطة واضحة ومحددة.'
      },
      {
        role: 'user',
        content: prompt
      }
    ]);

    // استخراج الخطوات
    const lines = completion.split('\n').map(line => line.trim());
    const steps = lines.filter(line => line.includes('[') && line.includes(']'));
    
    if (steps.length === 0) {
      throw new Error('لم يتم إنشاء خطة صالحة. يرجى إعادة صياغة الهدف بشكل أوضح');
    }

    if (steps.length > 7) {
      throw new Error('الخطة معقدة جداً. يرجى تبسيط الهدف');
    }

    return steps.slice(0, 5); // حد أقصى 5 خطوات
  }

  static async executeTask(
    task: string, 
    tool: Tool, 
    goal: string, 
    previousResults: string[]
  ): Promise<string> {
    const startTime = Date.now();

    try {
      if (tool === 'web_search') {
        return await SearchService.search(task);
      }

      // المهام الأخرى
      const context = previousResults.length > 0 ? 
        `السياق من الخطوات السابقة:\n${previousResults.join('\n\n')}` : 
        'هذه هي الخطوة الأولى.';

      const systemPrompts = {
        data_analysis: 'أنت محلل بيانات خبير. حلل المعلومات واستخرج النقاط المهمة بوضوح.',
        content_writer: 'أنت كاتب محترف. اكتب محتوى مفيد وواضح وجذاب.',
        general: 'أنت مساعد ذكي. قدم إجابة مفيدة ودقيقة.'
      };

      const prompt = `الهدف الأصلي: "${goal}"

${context}

مهمتك: "${task}"

قم بتنفيذ هذه المهمة بدقة ووضوح:`;

      return await LLMService.makeRequest([
        {
          role: 'system',
          content: systemPrompts[tool] || systemPrompts.general
        },
        {
          role: 'user',
          content: prompt
        }
      ]);

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'خطأ غير معروف';
      throw new Error(`فشل في تنفيذ "${task}": ${errorMsg}`);
    }
  }

  static async generateFinalSummary(goal: string, executionLog: ExecutionLog[]): Promise<string> {
    const logSummary = executionLog
      .filter(log => log.success)
      .map(log => `✅ ${log.task}\n📋 النتيجة: ${log.output.substring(0, 200)}...`)
      .join('\n\n');

    const prompt = `بناءً على الهدف والنتائج، اكتب ملخصاً نهائياً شاملاً ومفيداً.

الهدف: "${goal}"

النتائج المحققة:
${logSummary}

اكتب ملخصاً نهائياً باللغة العربية يجيب على الهدف الأصلي:`;

    return await LLMService.makeRequest([
      {
        role: 'system',
        content: 'أنت كاتب محترف متخصص في كتابة الملخصات الشاملة والمفيدة.'
      },
      {
        role: 'user',
        content: prompt
      }
    ]);
  }
}

// --- Store الرئيسي ---
export const useAgentStore = create<AgentState>()(
  devtools(
    (set, get) => ({
      // الحالة الأولية
      isProcessing: false,
      currentTask: null,
      progress: 0,
      executionLog: [],
      lastError: null,

      // مسح البيانات
      clearLog: () => {
        set({ executionLog: [], progress: 0, lastError: null });
      },

      // إعادة تعيين الحالة
      resetState: () => {
        set({
          isProcessing: false,
          currentTask: null,
          progress: 0,
          executionLog: [],
          lastError: null,
        });
      },

      // المعالج الرئيسي
      processGoal: async (goal: string): Promise<string> => {
        const state = get();
        
        // منع المعالجة المتوازية
        if (state.isProcessing) {
          throw new Error('يوجد مهمة أخرى قيد المعالجة. يرجى الانتظار');
        }

        // إعادة تعيين الحالة
        set({
          isProcessing: true,
          currentTask: '🎯 جاري تحليل الهدف...',
          progress: 5,
          executionLog: [],
          lastError: null,
        });

        try {
          // 1. إنشاء الخطة
          const plan = await TaskManager.createPlan(goal);
          set({ 
            currentTask: `📋 تم إنشاء خطة من ${plan.length} خطوات`,
            progress: 15 
          });

          const results: string[] = [];

          // 2. تنفيذ الخطوات
          for (let i = 0; i < plan.length; i++) {
            const stepText = plan[i];
            const toolMatch = stepText.match(/\[(.*?)\]/);
            const tool: Tool = (toolMatch?.[1] as Tool) || 'general';
            const task = stepText.replace(/\[.*?\]\s*/, '').trim();

            const stepProgress = 15 + Math.round(((i + 1) / plan.length) * 60); // 15-75%
            set({ 
              currentTask: `⏳ الخطوة ${i + 1}/${plan.length}: ${task}`,
              progress: stepProgress
            });

            const startTime = Date.now();
            let success = true;
            let output = '';

            try {
              output = await TaskManager.executeTask(task, tool, goal, results);
              results.push(output);
            } catch (error) {
              success = false;
              output = `خطأ: ${error instanceof Error ? error.message : 'فشل في التنفيذ'}`;
              console.error(`فشل في الخطوة ${i + 1}:`, error);
            }

            const duration = Date.now() - startTime;

            // تحديث السجل
            set(state => ({
              executionLog: [...state.executionLog, {
                step: i + 1,
                tool,
                task,
                output,
                timestamp: Date.now(),
                duration,
                success
              }]
            }));

            // استراحة قصيرة
            if (i < plan.length - 1) {
              await new Promise(resolve => setTimeout(resolve, 800));
            }
          }

          // 3. الملخص النهائي
          set({ 
            currentTask: '📝 جاري كتابة التقرير النهائي...',
            progress: 85 
          });

          const finalSummary = await TaskManager.generateFinalSummary(goal, get().executionLog);

          set({ 
            isProcessing: false,
            currentTask: null,
            progress: 100
          });

          return finalSummary;

        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'خطأ غير متوقع';
          
          set({
            isProcessing: false,
            currentTask: null,
            progress: 0,
            lastError: errorMessage,
          });

          return `❌ عذراً، واجهت مشكلة: ${errorMessage}\n\nيرجى المحاولة مرة أخرى مع صياغة أوضح للهدف.`;
        }
      },
    }),
    {
      name: 'agent-store', // للـ Redux DevTools
    }
  )
);

// --- Selectors مفيدة ---
export const useAgentProgress = () => useAgentStore(state => state.progress);
export const useAgentLogs = () => useAgentStore(state => state.executionLog);
export const useIsAgentProcessing = () => useAgentStore(state => state.isProcessing);
export const useAgentCurrentTask = () => useAgentStore(state => state.currentTask);
export const useAgentError = () => useAgentStore(state => state.lastError);

// --- Hook مدمج للاستخدام السهل ---
export const useAgent = () => {
  const store = useAgentStore();
  
  return {
    // الحالة
    isProcessing: store.isProcessing,
    currentTask: store.currentTask,
    progress: store.progress,
    logs: store.executionLog,
    error: store.lastError,
    
    // الوظائف
    processGoal: store.processGoal,
    clearLog: store.clearLog,
    resetState: store.resetState,
    
    // حالات مشتقة
    hasLogs: store.executionLog.length > 0,
    successfulSteps: store.executionLog.filter(log => log.success).length,
    failedSteps: store.executionLog.filter(log => !log.success).length,
  };
};