import { Agent, AgentType } from '@/types/chat';

export const AGENTS: Record<AgentType, Agent> = {
  general: {
    type: 'general',
    name: 'agent.general.name',
    description: 'agent.general.description',
    capabilities: [
      'agent.general.capabilities.0',
      'agent.general.capabilities.1',
      'agent.general.capabilities.2',
      'agent.general.capabilities.3',
      'agent.general.capabilities.4'
    ],
    systemPrompt: 'agent.general.systemPrompt',
    icon: '🤖',
    color: '#2563EB'
  },
  web_search: {
    type: 'web_search',
    name: 'agent.web_search.name',
    description: 'agent.web_search.description',
    capabilities: [
      'agent.web_search.capabilities.0',
      'agent.web_search.capabilities.1',
      'agent.web_search.capabilities.2',
      'agent.web_search.capabilities.3',
      'agent.web_search.capabilities.4'
    ],
    systemPrompt: 'agent.web_search.systemPrompt',
    icon: '🔍',
    color: '#059669'
  },
  image_generator: {
    type: 'image_generator',
    name: 'agent.image_generator.name',
    description: 'agent.image_generator.description',
    capabilities: [
      'agent.image_generator.capabilities.0',
      'agent.image_generator.capabilities.1',
      'agent.image_generator.capabilities.2',
      'agent.image_generator.capabilities.3',
      'agent.image_generator.capabilities.4'
    ],
    systemPrompt: 'agent.image_generator.systemPrompt',
    icon: '🎨',
    color: '#DC2626'
  },
  code_analyst: {
    type: 'code_analyst',
    name: 'agent.code_analyst.name',
    description: 'agent.code_analyst.description',
    capabilities: [
      'agent.code_analyst.capabilities.0',
      'agent.code_analyst.capabilities.1',
      'agent.code_analyst.capabilities.2',
      'agent.code_analyst.capabilities.3',
      'agent.code_analyst.capabilities.4'
    ],
    systemPrompt: 'agent.code_analyst.systemPrompt',
    icon: '💻',
    color: '#7C3AED'
  },
  document_analyzer: {
    type: 'document_analyzer',
    name: 'agent.document_analyzer.name',
    description: 'agent.document_analyzer.description',
    capabilities: [
      'agent.document_analyzer.capabilities.0',
      'agent.document_analyzer.capabilities.1',
      'agent.document_analyzer.capabilities.2',
      'agent.document_analyzer.capabilities.3',
      'agent.document_analyzer.capabilities.4'
    ],
    systemPrompt: 'agent.document_analyzer.systemPrompt',
    icon: '📄',
    color: '#EA580C'
  },
  data_scientist: {
    type: 'data_scientist',
    name: 'agent.data_scientist.name',
    description: 'agent.data_scientist.description',
    capabilities: [
      'agent.data_scientist.capabilities.0',
      'agent.data_scientist.capabilities.1',
      'agent.data_scientist.capabilities.2',
      'agent.data_scientist.capabilities.3',
      'agent.data_scientist.capabilities.4'
    ],
    systemPrompt: 'agent.data_scientist.systemPrompt',
    icon: '📊',
    color: '#0891B2'
  },
  creative_writer: {
    type: 'creative_writer',
    name: 'agent.creative_writer.name',
    description: 'agent.creative_writer.description',
    capabilities: [
      'agent.creative_writer.capabilities.0',
      'agent.creative_writer.capabilities.1',
      'agent.creative_writer.capabilities.2',
      'agent.creative_writer.capabilities.3',
      'agent.creative_writer.capabilities.4'
    ],
    systemPrompt: 'agent.creative_writer.systemPrompt',
    icon: '✍️',
    color: '#BE185D'
  },
  translator: {
    type: 'translator',
    name: 'agent.translator.name',
    description: 'agent.translator.description',
    capabilities: [
      'agent.translator.capabilities.0',
      'agent.translator.capabilities.1',
      'agent.translator.capabilities.2',
      'agent.translator.capabilities.3',
      'agent.translator.capabilities.4'
    ],
    systemPrompt: 'agent.translator.systemPrompt',
    icon: '🌐',
    color: '#059669'
  },
  researcher: {
    type: 'researcher',
    name: 'agent.researcher.name',
    description: 'agent.researcher.description',
    capabilities: [
      'agent.researcher.capabilities.0',
      'agent.researcher.capabilities.1',
      'agent.researcher.capabilities.2',
      'agent.researcher.capabilities.3',
      'agent.researcher.capabilities.4'
    ],
    systemPrompt: 'agent.researcher.systemPrompt',
    icon: '🔬',
    color: '#7C2D12'
  },
  planner: {
    type: 'planner',
    name: 'agent.planner.name',
    description: 'agent.planner.description',
    capabilities: [
      'agent.planner.capabilities.0',
      'agent.planner.capabilities.1',
      'agent.planner.capabilities.2',
      'agent.planner.capabilities.3',
      'agent.planner.capabilities.4'
    ],
    systemPrompt: 'agent.planner.systemPrompt',
    icon: '📅',
    color: '#0F766E'
  },
  financial_analyst: {
    type: 'financial_analyst',
    name: 'agent.financial_analyst.name',
    description: 'agent.financial_analyst.description',
    capabilities: [
      'agent.financial_analyst.capabilities.0',
      'agent.financial_analyst.capabilities.1',
      'agent.financial_analyst.capabilities.2',
      'agent.financial_analyst.capabilities.3',
      'agent.financial_analyst.capabilities.4'
    ],
    systemPrompt: 'agent.financial_analyst.systemPrompt',
    icon: '💰',
    color: '#059669'
  },
  travel_agent: {
    type: 'travel_agent',
    name: 'agent.travel_agent.name',
    description: 'agent.travel_agent.description',
    capabilities: [
      'agent.travel_agent.capabilities.0',
      'agent.travel_agent.capabilities.1',
      'agent.travel_agent.capabilities.2',
      'agent.travel_agent.capabilities.3',
      'agent.travel_agent.capabilities.4'
    ],
    systemPrompt: 'agent.travel_agent.systemPrompt',
    icon: '✈️',
    color: '#0284C7'
  },
  health_advisor: {
    type: 'health_advisor',
    name: 'agent.health_advisor.name',
    description: 'agent.health_advisor.description',
    capabilities: [
      'agent.health_advisor.capabilities.0',
      'agent.health_advisor.capabilities.1',
      'agent.health_advisor.capabilities.2',
      'agent.health_advisor.capabilities.3',
      'agent.health_advisor.capabilities.4'
    ],
    systemPrompt: 'agent.health_advisor.systemPrompt',
    icon: '🏥',
    color: '#DC2626'
  },
  education_tutor: {
    type: 'education_tutor',
    name: 'agent.education_tutor.name',
    description: 'agent.education_tutor.description',
    capabilities: [
      'agent.education_tutor.capabilities.0',
      'agent.education_tutor.capabilities.1',
      'agent.education_tutor.capabilities.2',
      'agent.education_tutor.capabilities.3',
      'agent.education_tutor.capabilities.4'
    ],
    systemPrompt: 'agent.education_tutor.systemPrompt',
    icon: '🎓',
    color: '#7C3AED'
  },
  live_search_agent: {
    type: 'live_search_agent',
    name: 'agent.live_search_agent.name',
    description: 'agent.live_search_agent.description',
    capabilities: [
      'agent.live_search_agent.capabilities.0',
      'agent.live_search_agent.capabilities.1',
      'agent.live_search_agent.capabilities.2',
      'agent.live_search_agent.capabilities.3',
      'agent.live_search_agent.capabilities.4'
    ],
    systemPrompt: 'agent.live_search_agent.systemPrompt',
    icon: '🔴',
    color: '#EF4444'
  },
  file_analyzer: {
    type: 'file_analyzer',
    name: 'agent.file_analyzer.name',
    description: 'agent.file_analyzer.description',
    capabilities: [
      'agent.file_analyzer.capabilities.0',
      'agent.file_analyzer.capabilities.1',
      'agent.file_analyzer.capabilities.2',
      'agent.file_analyzer.capabilities.3',
      'agent.file_analyzer.capabilities.4'
    ],
    systemPrompt: 'agent.file_analyzer.systemPrompt',
    icon: '📁',
    color: '#0891B2'
  },
  code_executor: {
    type: 'code_executor',
    name: 'agent.code_executor.name',
    description: 'agent.code_executor.description',
    capabilities: [
      'agent.code_executor.capabilities.0',
      'agent.code_executor.capabilities.1',
      'agent.code_executor.capabilities.2',
      'agent.code_executor.capabilities.3',
      'agent.code_executor.capabilities.4'
    ],
    systemPrompt: 'agent.code_executor.systemPrompt',
    icon: '⚡',
    color: '#F59E0B'
  }
};

export const getAllAgents = (): Agent[] => {
  return Object.values(AGENTS);
};

export const getAgentByType = (type: AgentType): Agent | undefined => {
  return AGENTS[type];
};

