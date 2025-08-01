import { Feature } from '@/components/FeatureCard';

export type FeatureCategory = 'general' | 'content' | 'media' | 'special' | 'files';

export const features: Feature[] = [
  // General Capabilities
  {
    id: 'general-chat',
    title: 'المحادثة الذكية',
    description: 'محادثة طبيعية ومفيدة في جميع المواضيع',
    icon: '💬',
    category: 'general',
    isAvailable: true,
  },
  {
    id: 'web-search',
    title: 'البحث في الإنترنت',
    description: 'البحث عن أحدث المعلومات والأخبار',
    icon: '🔍',
    category: 'general',
    isAvailable: true,
  },
  {
    id: 'live-search',
    title: 'البحث المباشر',
    description: 'معلومات حية ومحدثة في الوقت الفعلي',
    icon: '🔴',
    category: 'general',
    isAvailable: true,
  },
  {
    id: 'translation',
    title: 'الترجمة الفورية',
    description: 'ترجمة دقيقة بين العربية والإنجليزية',
    icon: '🌐',
    category: 'general',
    isAvailable: true,
  },
  {
    id: 'math-calculator',
    title: 'الآلة الحاسبة المتقدمة',
    description: 'حل المعادلات والعمليات الحسابية المعقدة',
    icon: '🧮',
    category: 'general',
    isAvailable: true,
  },

  // Creative Content
  {
    id: 'image-generation',
    title: 'إنشاء الصور',
    description: 'توليد صور فنية من الوصف النصي',
    icon: '🎨',
    category: 'content',
    isAvailable: true,
  },
  {
    id: 'creative-writing',
    title: 'الكتابة الإبداعية',
    description: 'كتابة القصص والشعر والمحتوى الإبداعي',
    icon: '✍️',
    category: 'content',
    isAvailable: true,
  },
  {
    id: 'content-creation',
    title: 'إنشاء المحتوى',
    description: 'كتابة المقالات والمحتوى التسويقي',
    icon: '📝',
    category: 'content',
    isAvailable: true,
  },
  {
    id: 'video-script',
    title: 'كتابة السيناريوهات',
    description: 'إعداد نصوص الفيديوهات والعروض',
    icon: '🎬',
    category: 'content',
    isAvailable: false,
  },

  // Multimedia Analysis
  {
    id: 'image-analysis',
    title: 'تحليل الصور',
    description: 'فهم وتحليل محتوى الصور والرسوم',
    icon: '🖼️',
    category: 'media',
    isAvailable: true,
  },
  {
    id: 'audio-transcription',
    title: 'تحويل الصوت لنص',
    description: 'تحويل التسجيلات الصوتية إلى نص مكتوب',
    icon: '🎤',
    category: 'media',
    isAvailable: true,
  },
  {
    id: 'video-analysis',
    title: 'تحليل الفيديو',
    description: 'استخراج المعلومات من مقاطع الفيديو',
    icon: '📹',
    category: 'media',
    isAvailable: false,
  },
  {
    id: 'music-generation',
    title: 'إنشاء الموسيقى',
    description: 'توليد المقاطع الموسيقية والألحان',
    icon: '🎵',
    category: 'media',
    isAvailable: false,
  },

  // Special Capabilities
  {
    id: 'code-analysis',
    title: 'تحليل الأكواد',
    description: 'فهم وتحليل الأكواد البرمجية',
    icon: '💻',
    category: 'special',
    isAvailable: true,
  },
  {
    id: 'data-analysis',
    title: 'تحليل البيانات',
    description: 'تحليل البيانات وإنشاء الرسوم البيانية',
    icon: '📊',
    category: 'special',
    isAvailable: true,
  },
  {
    id: 'financial-analysis',
    title: 'التحليل المالي',
    description: 'تحليل الأسهم والاستثمارات المالية',
    icon: '💰',
    category: 'special',
    isAvailable: true,
  },
  {
    id: 'research-assistant',
    title: 'مساعد البحث',
    description: 'إجراء البحوث الأكاديمية والعلمية',
    icon: '🔬',
    category: 'special',
    isAvailable: true,
  },
  {
    id: 'travel-planning',
    title: 'تخطيط الرحلات',
    description: 'التخطيط للسفر والسياحة',
    icon: '✈️',
    category: 'special',
    isAvailable: true,
  },
  {
    id: 'health-advisor',
    title: 'الاستشارة الصحية',
    description: 'نصائح صحية عامة ومعلومات طبية',
    icon: '🏥',
    category: 'special',
    isAvailable: true,
  },

  // File Management
  {
    id: 'document-analysis',
    title: 'تحليل المستندات',
    description: 'قراءة وتحليل ملفات PDF والمستندات',
    icon: '📄',
    category: 'files',
    isAvailable: true,
  },
  {
    id: 'spreadsheet-analysis',
    title: 'تحليل جداول البيانات',
    description: 'معالجة ملفات Excel وجداول البيانات',
    icon: '📈',
    category: 'files',
    isAvailable: true,
  },
  {
    id: 'file-conversion',
    title: 'تحويل الملفات',
    description: 'تحويل بين صيغ الملفات المختلفة',
    icon: '🔄',
    category: 'files',
    isAvailable: false,
  },
  {
    id: 'file-organization',
    title: 'تنظيم الملفات',
    description: 'فهرسة وتنظيم الملفات والمجلدات',
    icon: '📁',
    category: 'files',
    isAvailable: false,
  },
];

export const getFeaturesByCategory = (category: FeatureCategory): Feature[] => {
  return features.filter(feature => feature.category === category);
};

export const getAvailableFeatures = (): Feature[] => {
  return features.filter(feature => feature.isAvailable);
};

export const getFeatureById = (id: string): Feature | undefined => {
  return features.find(feature => feature.id === id);
};

