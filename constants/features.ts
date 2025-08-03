import { Feature } from '@/components/FeatureCard';

export type FeatureCategory = 'general' | 'content' | 'media' | 'special' | 'files';

export const features: Feature[] = [
  // General Capabilities
  {
    id: 'general-chat',
    title: 'features.general-chat.title',
    description: 'features.general-chat.description',
    icon: '💬',
    category: 'general',
    isAvailable: true,
  },
  {
    id: 'web-search',
    title: 'features.web-search.title',
    description: 'features.web-search.description',
    icon: '🔍',
    category: 'general',
    isAvailable: true,
  },
  {
    id: 'live-search',
    title: 'features.live-search.title',
    description: 'features.live-search.description',
    icon: '🔴',
    category: 'general',
    isAvailable: true,
  },
  {
    id: 'translation',
    title: 'features.translation.title',
    description: 'features.translation.description',
    icon: '🌐',
    category: 'general',
    isAvailable: true,
  },
  {
    id: 'math-calculator',
    title: 'features.math-calculator.title',
    description: 'features.math-calculator.description',
    icon: '🧮',
    category: 'general',
    isAvailable: true,
  },

  // Creative Content
  {
    id: 'image-generation',
    title: 'features.image-generation.title',
    description: 'features.image-generation.description',
    icon: '🎨',
    category: 'content',
    isAvailable: true,
  },
  {
    id: 'creative-writing',
    title: 'features.creative-writing.title',
    description: 'features.creative-writing.description',
    icon: '✍️',
    category: 'content',
    isAvailable: true,
  },
  {
    id: 'content-creation',
    title: 'features.content-creation.title',
    description: 'features.content-creation.description',
    icon: '📝',
    category: 'content',
    isAvailable: true,
  },
  {
    id: 'video-script',
    title: 'features.video-script.title',
    description: 'features.video-script.description',
    icon: '🎬',
    category: 'content',
    isAvailable: false,
  },

  // Multimedia Analysis
  {
    id: 'image-analysis',
    title: 'features.image-analysis.title',
    description: 'features.image-analysis.description',
    icon: '🖼️',
    category: 'media',
    isAvailable: true,
  },
  {
    id: 'audio-transcription',
    title: 'features.audio-transcription.title',
    description: 'features.audio-transcription.description',
    icon: '🎤',
    category: 'media',
    isAvailable: true,
  },
  {
    id: 'video-analysis',
    title: 'features.video-analysis.title',
    description: 'features.video-analysis.description',
    icon: '📹',
    category: 'media',
    isAvailable: false,
  },
  {
    id: 'music-generation',
    title: 'features.music-generation.title',
    description: 'features.music-generation.description',
    icon: '🎵',
    category: 'media',
    isAvailable: false,
  },

  // Special Capabilities
  {
    id: 'code-analysis',
    title: 'features.code-analysis.title',
    description: 'features.code-analysis.description',
    icon: '💻',
    category: 'special',
    isAvailable: true,
  },
  {
    id: 'data-analysis',
    title: 'features.data-analysis.title',
    description: 'features.data-analysis.description',
    icon: '📊',
    category: 'special',
    isAvailable: true,
  },
  {
    id: 'financial-analysis',
    title: 'features.financial-analysis.title',
    description: 'features.financial-analysis.description',
    icon: '💰',
    category: 'special',
    isAvailable: true,
  },
  {
    id: 'research-assistant',
    title: 'features.research-assistant.title',
    description: 'features.research-assistant.description',
    icon: '🔬',
    category: 'special',
    isAvailable: true,
  },
  {
    id: 'travel-planning',
    title: 'features.travel-planning.title',
    description: 'features.travel-planning.description',
    icon: '✈️',
    category: 'special',
    isAvailable: true,
  },
  {
    id: 'health-advisor',
    title: 'features.health-advisor.title',
    description: 'features.health-advisor.description',
    icon: '🏥',
    category: 'special',
    isAvailable: true,
  },

  // File Management
  {
    id: 'document-analysis',
    title: 'features.document-analysis.title',
    description: 'features.document-analysis.description',
    icon: '📄',
    category: 'files',
    isAvailable: true,
  },
  {
    id: 'spreadsheet-analysis',
    title: 'features.spreadsheet-analysis.title',
    description: 'features.spreadsheet-analysis.description',
    icon: '📈',
    category: 'files',
    isAvailable: true,
  },
  {
    id: 'file-conversion',
    title: 'features.file-conversion.title',
    description: 'features.file-conversion.description',
    icon: '🔄',
    category: 'files',
    isAvailable: false,
  },
  {
    id: 'file-organization',
    title: 'features.file-organization.title',
    description: 'features.file-organization.description',
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

