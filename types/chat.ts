export type MessageRole = 'user' | 'assistant' | 'system';

export type ContentType = 'text' | 'image' | 'audio' | 'video' | 'file' | 'web_search' | 'generated_image' | 'analysis' | 'code' | 'live_search' | 'file_analysis' | 'code_execution';

export interface ContentPart {
  type: ContentType;
  content: string;
  mimeType?: string;
  metadata?: {
    url?: string;
    title?: string;
    description?: string;
    size?: string;
    language?: string;
    searchQuery?: string;
    analysisType?: string;
    codeLanguage?: string;
    prompt?: string;
    fileName?: string;
    fileType?: string;
    executionTime?: number;
    searchResults?: LiveSearchResult[];
    codeOutput?: string;
    error?: string;
    searchSteps?: Array<{
      step: number;
      action: string;
      query?: string;
      url?: string;
      status: 'pending' | 'completed' | 'failed';
      timestamp: number;
    }>;
    searchDuration?: string;
    sourcesCount?: number;
  };
}

export interface Message {
  id: string;
  role: MessageRole;
  content: ContentPart[];
  timestamp: number;
  agentType?: AgentType;
  isThinking?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
  activeAgents?: AgentType[];
}

export type AgentType = 
  | 'general'
  | 'web_search'
  | 'image_generator'
  | 'code_analyst'
  | 'document_analyzer'
  | 'data_scientist'
  | 'creative_writer'
  | 'translator'
  | 'researcher'
  | 'planner'
  | 'financial_analyst'
  | 'travel_agent'
  | 'health_advisor'
  | 'education_tutor'
  | 'live_search_agent'
  | 'file_analyzer'
  | 'code_executor';

export interface Agent {
  type: AgentType;
  name: string;
  description: string;
  capabilities: string[];
  systemPrompt: string;
  icon: string;
  color: string;
}

export interface TaskResult {
  success: boolean;
  data?: any;
  error?: string;
  metadata?: Record<string, any>;
}

export interface WebSearchResult {
  title: string;
  url: string;
  snippet: string;
  timestamp?: string;
}

export interface ImageGenerationRequest {
  prompt: string;
  size?: string;
  style?: string;
}

export interface AnalysisRequest {
  type: 'image' | 'document' | 'data' | 'code';
  content: string;
  options?: Record<string, any>;
}

export interface LiveSearchResult {
  title: string;
  url: string;
  snippet: string;
  source: string;
  timestamp?: string;
  relevanceScore?: number;
}

export interface FileAnalysisRequest {
  fileName: string;
  fileType: string;
  content: string;
  analysisType?: 'summary' | 'extract' | 'translate' | 'analyze';
}

export interface CodeExecutionRequest {
  code: string;
  language: 'python' | 'javascript' | 'sql';
  timeout?: number;
}

