import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useAgent } from '@/hooks/agent-store';
import { useLanguage } from '@/hooks/language-store';
import colors from '@/constants/colors';
import { Agent } from '@/types/chat';

export default function AgentsScreen() {
  const { t } = useLanguage();
  const { activeAgents, activateAgent, deactivateAgent, getAllAgents } = useAgent();

  const allAgents = getAllAgents();

  const handleAgentToggle = (agent: Agent) => {
    if (activeAgents.includes(agent.type)) {
      deactivateAgent(agent.type);
    } else {
      activateAgent(agent.type);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('agents.title', 'AI Agents')}</Text>
      <ScrollView contentContainerStyle={styles.agentList}>
        {allAgents.map((agent) => (
          <TouchableOpacity
            key={agent.type}
            style={[
              styles.agentCard,
              activeAgents.includes(agent.type) && styles.agentCardActive,
            ]}
            onPress={() => handleAgentToggle(agent)}
          >
            <View style={styles.agentHeader}>
              <Text style={styles.agentEmoji}>{agent.icon}</Text>
              <Text style={styles.agentName}>{agent.name}</Text>
            </View>
            <Text style={styles.agentDescription}>{agent.description}</Text>
            <View style={styles.capabilitiesContainer}>
              {agent.capabilities.map((capability, index) => (
                <Text key={index} style={styles.capability}>- {capability}</Text>
              ))}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 20,
  },
  agentList: {
    paddingBottom: 20,
  },
  agentCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  agentCardActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10', // 10% opacity of primary color
  },
  agentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  agentEmoji: {
    fontSize: 24,
    marginRight: 10,
  },
  agentName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  agentDescription: {
    fontSize: 14,
    color: colors.placeholder,
    marginBottom: 10,
  },
  capabilitiesContainer: {
    marginTop: 5,
  },
  capability: {
    fontSize: 12,
    color: colors.text,
    marginBottom: 2,
  },
});


