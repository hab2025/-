import createContextHook from '@nkzw/create-context-hook';
import { useState } from 'react';
import { AgentType, Agent, TaskResult, WebSearchResult, ImageGenerationRequest, AnalysisRequest, LiveSearchResult, FileAnalysisRequest, CodeExecutionRequest } from '@/types/chat';
import { AGENTS } from '@/constants/agents';

export const [AgentContext, useAgent] = createContextHook(() => {
  const [activeAgents, setActiveAgents] = useState<AgentType[]>(['general']);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [currentTask, setCurrentTask] = useState<string | null>(null);

  const activateAgent = (agentType: AgentType) => {
    if (!activeAgents.includes(agentType)) {
      setActiveAgents(prev => [...prev, agentType]);
    }
  };

  const deactivateAgent = (agentType: AgentType) => {
    if (agentType !== 'general') { // General agent always active
      setActiveAgents(prev => prev.filter(type => type !== agentType));
    }
  };

  const getActiveAgents = (): Agent[] => {
    return activeAgents.map(type => AGENTS[type]).filter(Boolean);
  };

  const getAllAgents = (): Agent[] => {
    return Object.values(AGENTS);
  };

  const selectBestAgent = async (query: string, contextMessages?: any[]): Promise<AgentType> => {
    const lowerQuery = query.toLowerCase();
    
    // Live search keywords (high priority for real-time info)
    if (lowerQuery.includes('سعر') || lowerQuery.includes('price') || 
        lowerQuery.includes('current') || lowerQuery.includes('الحالي') ||
        lowerQuery.includes('آخر سعر') || lowerQuery.includes('stock') ||
        lowerQuery.includes('أسهم') || lowerQuery.includes('live') ||
        lowerQuery.includes('مباشر') || lowerQuery.includes('فوري') ||
        lowerQuery.includes('حديث') || lowerQuery.includes('الآن') ||
        lowerQuery.includes('اليوم') || lowerQuery.includes('latest') ||
        lowerQuery.includes('أخبار') || lowerQuery.includes('news') ||
        lowerQuery.includes('اخبار') || lowerQuery.includes('معلومات حية') ||
        lowerQuery.includes('معلومات محدثة') || lowerQuery.includes('آخر الأخبار')) {
      return 'live_search_agent';
    }
    
    // Code execution keywords (for math and calculations)
    if (lowerQuery.includes('احسب') || lowerQuery.includes('calculate') || 
        lowerQuery.includes('ضرب') || lowerQuery.includes('multiply') ||
        lowerQuery.includes('جمع') || lowerQuery.includes('add') ||
        lowerQuery.includes('طرح') || lowerQuery.includes('subtract') ||
        lowerQuery.includes('قسمة') || lowerQuery.includes('divide') ||
        lowerQuery.includes('رياضيات') || lowerQuery.includes('math') ||
        lowerQuery.includes('معادلة') || lowerQuery.includes('equation')) {
      return 'code_executor';
    }
    
    // Web search keywords (general search)
    if (lowerQuery.includes('ابحث') || lowerQuery.includes('search') || 
        lowerQuery.includes('معلومات عن') || lowerQuery.includes('أخبار') ||
        lowerQuery.includes('آخر') || lowerQuery.includes('جديد') ||
        lowerQuery.includes('ما هو') || lowerQuery.includes('what is') ||
        lowerQuery.includes('كيف') || lowerQuery.includes('how') ||
        lowerQuery.includes('لماذا') || lowerQuery.includes('why')) {
      return 'web_search';
    }
    
    // Image generation keywords
    if (lowerQuery.includes('ارسم') || lowerQuery.includes('صورة') || 
        lowerQuery.includes('تصميم') || lowerQuery.includes('generate image') ||
        lowerQuery.includes('create image') || lowerQuery.includes('أنشئ صورة')) {
      return 'image_generator';
    }
    
    // Code analysis keywords
    if (lowerQuery.includes('كود') || lowerQuery.includes('برمجة') || 
        lowerQuery.includes('code') || lowerQuery.includes('program') ||
        lowerQuery.includes('function') || lowerQuery.includes('algorithm')) {
      return 'code_analyst';
    }
    
    // Data analysis keywords
    if (lowerQuery.includes('بيانات') || lowerQuery.includes('إحصاء') || 
        lowerQuery.includes('data') || lowerQuery.includes('statistics') ||
        lowerQuery.includes('chart') || lowerQuery.includes('graph')) {
      return 'data_scientist';
    }
    
    // Translation keywords
    if (lowerQuery.includes('ترجم') || lowerQuery.includes('translate') || 
        lowerQuery.includes('باللغة') || lowerQuery.includes('in english') ||
        lowerQuery.includes('in arabic')) {
      return 'translator';
    }
    
    // Creative writing keywords
    if (lowerQuery.includes('اكتب') || lowerQuery.includes('قصة') || 
        lowerQuery.includes('شعر') || lowerQuery.includes('write') ||
        lowerQuery.includes('story') || lowerQuery.includes('poem')) {
      return 'creative_writer';
    }
    
    // Planning keywords
    if (lowerQuery.includes('خطة') || lowerQuery.includes('خطط') || 
        lowerQuery.includes('plan') || lowerQuery.includes('schedule') ||
        lowerQuery.includes('organize') || lowerQuery.includes('نظم')) {
      return 'planner';
    }
    
    // Financial keywords
    if (lowerQuery.includes('مالي') || lowerQuery.includes('استثمار') || 
        lowerQuery.includes('financial') || lowerQuery.includes('investment') ||
        lowerQuery.includes('money') || lowerQuery.includes('budget')) {
      return 'financial_analyst';
    }
    
    // Travel keywords
    if (lowerQuery.includes('سفر') || lowerQuery.includes('رحلة') || 
        lowerQuery.includes('travel') || lowerQuery.includes('trip') ||
        lowerQuery.includes('vacation') || lowerQuery.includes('hotel')) {
      return 'travel_agent';
    }
    
    // Health keywords
    if (lowerQuery.includes('صحة') || lowerQuery.includes('طبي') || 
        lowerQuery.includes('health') || lowerQuery.includes('medical') ||
        lowerQuery.includes('diet') || lowerQuery.includes('fitness')) {
      return 'health_advisor';
    }
    
    // Education keywords
    if (lowerQuery.includes('تعلم') || lowerQuery.includes('شرح') || 
        lowerQuery.includes('learn') || lowerQuery.includes('explain') ||
        lowerQuery.includes('teach') || lowerQuery.includes('study')) {
      return 'education_tutor';
    }
    
    return 'general';
  };

  const processWithAgent = async (
    agentType: AgentType, 
    query: string, 
    context?: any
  ): Promise<TaskResult> => {
    setIsProcessing(true);
    setCurrentTask('🤔 جاري تحليل الطلب...');
    
    try {
      // Select the best agent for the query
      const bestAgent = await selectBestAgent(query);
      const agent = AGENTS[bestAgent] || AGENTS['general'];
      
      setCurrentTask(`🧠 استخدام ${agent.name}...`);
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Process based on agent type
      switch (bestAgent) {
        case 'web_search':
          return await performWebSearch(query);
        case 'live_search_agent':
          return await performLiveSearch(query);
        case 'image_generator':
          return await generateImage({ prompt: query });
        case 'code_executor':
          return await executeCode(query, context);
        case 'code_analyst':
          return await analyzeCode(query, context);
        case 'data_scientist':
          return await analyzeData(query, context);
        case 'translator':
          return await translateText(query, context);
        case 'creative_writer':
          return await generateCreativeContent(query, context);
        case 'financial_analyst':
          return await analyzeFinancial(query, context);
        case 'travel_agent':
          return await planTravel(query, context);
        case 'health_advisor':
          return await provideHealthAdvice(query, context);
        case 'education_tutor':
          return await provideTutoring(query, context);
        case 'document_analyzer':
          return await analyzeDocument(query, context);
        case 'file_analyzer':
          return await analyzeFile(query, context);
        default:
          return await processGeneralQuery(agent, query, context);
      }
    } catch (error) {
      console.error('Agent processing error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    } finally {
      setIsProcessing(false);
      setCurrentTask(null);
    }
  };

  const performWebSearch = async (query: string): Promise<TaskResult> => {
    try {
      setCurrentTask('🌐 البحث في الإنترنت...');
      
      const response = await fetch('https://toolkit.rork.com/text/llm/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: 'أنت وكيل بحث متقدم. ابحث عن المعلومات المطلوبة وقدم إجابة شاملة مع ذكر المصادر.'
            },
            {
              role: 'user',
              content: `ابحث عن معلومات حول: ${query}`
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error('Web search API failed');
      }

      const data = await response.json();
      
      const searchResults: WebSearchResult[] = [
        {
          title: `نتائج البحث: ${query}`,
          url: 'https://www.google.com/search?q=' + encodeURIComponent(query),
          snippet: data.completion.substring(0, 200) + '...',
          timestamp: new Date().toISOString()
        }
      ];

      return {
        success: true,
        data: {
          response: data.completion,
          searchResults: searchResults
        },
        metadata: { searchQuery: query, resultCount: searchResults.length }
      };
    } catch (error) {
      return {
        success: false,
        error: 'فشل في البحث على الإنترنت - تحقق من الاتصال'
      };
    }
  };

  const performLiveSearch = async (query: string): Promise<TaskResult> => {
    try {
      setCurrentTask('🔍 البحث المباشر...');
      
      // Import the real-time search API
      const { realTimeSearchAPI } = await import('@/services/api/realTimeSearchAPI');
      
      // Perform real-time search
      const searchResults = await realTimeSearchAPI.smartSearch(query, 'ar');
      
      if (searchResults.length === 0) {
        return {
          success: false,
          error: 'لم يتم العثور على نتائج حديثة لهذا البحث'
        };
      }
      
      // Format the results into a readable response
      let response = `🔍 **نتائج البحث المباشر لـ "${query}":**\n\n`;
      
      searchResults.slice(0, 5).forEach((result, index) => {
        response += `**${index + 1}. ${result.title}**\n`;
        response += `${result.snippet}\n`;
        response += `📅 ${new Date(result.timestamp || '').toLocaleDateString('ar-SA')}\n`;
        response += `🔗 المصدر: ${result.source}\n\n`;
      });
      
      if (searchResults.length > 5) {
        response += `... وهناك ${searchResults.length - 5} نتائج أخرى\n`;
      }
      
      return {
        success: true,
        data: { 
          response: response,
          searchResults: searchResults.map(result => ({
            title: result.title,
            url: result.url,
            snippet: result.snippet,
            timestamp: result.timestamp
          }))
        },
        metadata: { 
          searchQuery: query, 
          searchType: 'live',
          resultCount: searchResults.length,
          sources: [...new Set(searchResults.map(r => r.source))]
        }
      };
    } catch (error) {
      console.error('Live search error:', error);
      return {
        success: false,
        error: 'فشل في البحث المباشر - تحقق من الاتصال بالإنترنت'
      };
    }
  };

  const generateImage = async (request: ImageGenerationRequest): Promise<TaskResult> => {
    try {
      setCurrentTask('🎨 إنشاء الصورة...');
      
      const response = await fetch('https://toolkit.rork.com/images/generate/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: request.prompt,
          size: request.size || '1024x1024'
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.image && data.image.base64Data) {
        return {
          success: true,
          data: {
            response: 'تم إنشاء الصورة بنجاح!',
            imageUrl: `data:image/png;base64,${data.image.base64Data}`,
            prompt: request.prompt
          },
          metadata: { prompt: request.prompt, size: request.size }
        };
      } else {
        throw new Error('No image data received');
      }
    } catch (error) {
      return {
        success: false,
        error: 'فشل في إنشاء الصورة'
      };
    }
  };

  const executeCode = async (query: string, context?: any): Promise<TaskResult> => {
    try {
      setCurrentTask('⚡ تنفيذ العملية الحسابية...');
      
      const response = await fetch('https://toolkit.rork.com/text/llm/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: 'أنت منفذ أكواد متقدم. قم بحل المسائل الرياضية والحسابية وتنفيذ العمليات المطلوبة.'
            },
            {
              role: 'user',
              content: query
            }
          ]
        })
      });

      const data = await response.json();
      
      return {
        success: true,
        data: { response: data.completion },
        metadata: { executionType: 'calculation' }
      };
    } catch (error) {
      return {
        success: false,
        error: 'فشل في تنفيذ العملية'
      };
    }
  };

  const analyzeCode = async (query: string, context?: any): Promise<TaskResult> => {
    try {
      setCurrentTask('💻 تحليل الكود...');
      
      const response = await fetch('https://toolkit.rork.com/text/llm/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: 'أنت خبير في تحليل الأكواد البرمجية. قم بتحليل الكود وشرحه وتقديم التحسينات.'
            },
            {
              role: 'user',
              content: query
            }
          ]
        })
      });

      const data = await response.json();
      
      return {
        success: true,
        data: { response: data.completion },
        metadata: { analysisType: 'code' }
      };
    } catch (error) {
      return {
        success: false,
        error: 'فشل في تحليل الكود'
      };
    }
  };

  const analyzeData = async (query: string, context?: any): Promise<TaskResult> => {
    try {
      setCurrentTask('📊 تحليل البيانات...');
      
      const response = await fetch('https://toolkit.rork.com/text/llm/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: 'أنت عالم بيانات خبير. قم بتحليل البيانات وتقديم الرؤى والتفسيرات.'
            },
            {
              role: 'user',
              content: query
            }
          ]
        })
      });

      const data = await response.json();
      
      return {
        success: true,
        data: { response: data.completion },
        metadata: { analysisType: 'data' }
      };
    } catch (error) {
      return {
        success: false,
        error: 'فشل في تحليل البيانات'
      };
    }
  };

  const translateText = async (query: string, context?: any): Promise<TaskResult> => {
    try {
      setCurrentTask('🌐 الترجمة...');
      
      const response = await fetch('https://toolkit.rork.com/text/llm/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: 'أنت مترجم محترف. قم بالترجمة الدقيقة مع الحفاظ على المعنى والسياق.'
            },
            {
              role: 'user',
              content: query
            }
          ]
        })
      });

      const data = await response.json();
      
      return {
        success: true,
        data: { response: data.completion },
        metadata: { serviceType: 'translation' }
      };
    } catch (error) {
      return {
        success: false,
        error: 'فشل في الترجمة'
      };
    }
  };

  const generateCreativeContent = async (query: string, context?: any): Promise<TaskResult> => {
    try {
      setCurrentTask('✍️ الكتابة الإبداعية...');
      
      const response = await fetch('https://toolkit.rork.com/text/llm/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: 'أنت كاتب مبدع موهوب. اكتب محتوى إبداعي جميل ومؤثر.'
            },
            {
              role: 'user',
              content: query
            }
          ]
        })
      });

      const data = await response.json();
      
      return {
        success: true,
        data: { response: data.completion },
        metadata: { contentType: 'creative' }
      };
    } catch (error) {
      return {
        success: false,
        error: 'فشل في الكتابة الإبداعية'
      };
    }
  };

  const analyzeFinancial = async (query: string, context?: any): Promise<TaskResult> => {
    try {
      setCurrentTask('💰 التحليل المالي...');
      
      const response = await fetch('https://toolkit.rork.com/text/llm/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: 'أنت محلل مالي خبير. قدم تحليلات مالية دقيقة ونصائح استثمارية.'
            },
            {
              role: 'user',
              content: query
            }
          ]
        })
      });

      const data = await response.json();
      
      return {
        success: true,
        data: { response: data.completion },
        metadata: { analysisType: 'financial' }
      };
    } catch (error) {
      return {
        success: false,
        error: 'فشل في التحليل المالي'
      };
    }
  };

  const planTravel = async (query: string, context?: any): Promise<TaskResult> => {
    try {
      setCurrentTask('✈️ تخطيط الرحلة...');
      
      const response = await fetch('https://toolkit.rork.com/text/llm/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: 'أنت وكيل سفر محترف. ساعد في تخطيط الرحلات وقدم نصائح سياحية.'
            },
            {
              role: 'user',
              content: query
            }
          ]
        })
      });

      const data = await response.json();
      
      return {
        success: true,
        data: { response: data.completion },
        metadata: { serviceType: 'travel_planning' }
      };
    } catch (error) {
      return {
        success: false,
        error: 'فشل في تخطيط الرحلة'
      };
    }
  };

  const provideHealthAdvice = async (query: string, context?: any): Promise<TaskResult> => {
    try {
      setCurrentTask('🏥 الاستشارة الصحية...');
      
      const response = await fetch('https://toolkit.rork.com/text/llm/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: 'أنت مستشار صحي. قدم معلومات صحية عامة مع التأكيد على ضرورة استشارة الطبيب.'
            },
            {
              role: 'user',
              content: query
            }
          ]
        })
      });

      const data = await response.json();
      
      return {
        success: true,
        data: { response: data.completion },
        metadata: { serviceType: 'health_advice' }
      };
    } catch (error) {
      return {
        success: false,
        error: 'فشل في تقديم الاستشارة الصحية'
      };
    }
  };

  const provideTutoring = async (query: string, context?: any): Promise<TaskResult> => {
    try {
      setCurrentTask('🎓 التدريس...');
      
      const response = await fetch('https://toolkit.rork.com/text/llm/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: 'أنت معلم خبير. اشرح المفاهيم بطريقة واضحة ومبسطة.'
            },
            {
              role: 'user',
              content: query
            }
          ]
        })
      });

      const data = await response.json();
      
      return {
        success: true,
        data: { response: data.completion },
        metadata: { serviceType: 'tutoring' }
      };
    } catch (error) {
      return {
        success: false,
        error: 'فشل في التدريس'
      };
    }
  };

  const analyzeDocument = async (query: string, context?: any): Promise<TaskResult> => {
    try {
      setCurrentTask('📄 تحليل المستند...');
      
      const response = await fetch('https://toolkit.rork.com/text/llm/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: 'أنت خبير في تحليل المستندات. اقرأ وحلل المحتوى واستخرج المعلومات المهمة.'
            },
            {
              role: 'user',
              content: query
            }
          ]
        })
      });

      const data = await response.json();
      
      return {
        success: true,
        data: { response: data.completion },
        metadata: { analysisType: 'document' }
      };
    } catch (error) {
      return {
        success: false,
        error: 'فشل في تحليل المستند'
      };
    }
  };

  const analyzeFile = async (query: string, context?: any): Promise<TaskResult> => {
    try {
      setCurrentTask('📁 تحليل الملف...');
      
      const response = await fetch('https://toolkit.rork.com/text/llm/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: 'أنت خبير في تحليل الملفات. حلل محتوى الملف واستخرج المعلومات المفيدة.'
            },
            {
              role: 'user',
              content: query
            }
          ]
        })
      });

      const data = await response.json();
      
      return {
        success: true,
        data: { response: data.completion },
        metadata: { analysisType: 'file' }
      };
    } catch (error) {
      return {
        success: false,
        error: 'فشل في تحليل الملف'
      };
    }
  };

  const processGeneralQuery = async (agent: Agent, query: string, context?: any): Promise<TaskResult> => {
    try {
      setCurrentTask('💬 معالجة الطلب...');
      
      const response = await fetch('https://toolkit.rork.com/text/llm/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: agent.systemPrompt
            },
            {
              role: 'user',
              content: query
            }
          ]
        })
      });

      const data = await response.json();
      
      return {
        success: true,
        data: { response: data.completion },
        metadata: { agentType: agent.type }
      };
    } catch (error) {
      return {
        success: false,
        error: 'فشل في معالجة الطلب'
      };
    }
  };

  return {
    activeAgents,
    isProcessing,
    currentTask,
    activateAgent,
    deactivateAgent,
    getActiveAgents,
    getAllAgents,
    selectBestAgent,
    processWithAgent,
  };
});

