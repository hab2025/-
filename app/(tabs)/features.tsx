// app/(tabs)/features.tsx

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useAgentStore } from '@/hooks/agent-store';
import { useLanguage } from '@/hooks/language-store';
import { getAllAgents } from '@/constants/agents'; // <-- **THIS IS THE KEY FIX**
import { Agent, AgentType } from '@/types/chat'; // <-- Import the correct types
import colors from '@/constants/colors';
import { CheckCircle, Circle } from 'lucide-react-native';

// Get the list of all agents using the function you provided
const allAgents: Agent[] = getAllAgents();

export default function FeaturesScreen() {
  const { t } = useLanguage();
  // Get the active agent IDs from the real store
  const { activeAgents, activateAgent, deactivateAgent } = useAgentStore();

  // Create a Set for efficient checking
  const activeAgentIds = new Set(activeAgents);

  const handleToggleAgent = (agentId: AgentType) => {
    if (activeAgentIds.has(agentId)) {
      // Only allow deactivation if it's not the last agent
      if (activeAgents.length > 1) {
        deactivateAgent(agentId);
      }
    } else {
      activateAgent(agentId);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('features.title', 'Features')}</Text>
        <Text style={styles.headerSubtitle}>{t('chat.agentPicker.title', 'Select Active Agents')}</Text>
      </View>
      {/* Map over the correctly fetched list of agents */}
      {allAgents.map((agent) => (
        <TouchableOpacity
          key={agent.type} // Use agent.type as the key, it's the unique ID
          style={styles.agentCard}
          onPress={() => handleToggleAgent(agent.type)}
          // Disable button if it's the last active agent to prevent deactivation
          disabled={activeAgentIds.has(agent.type) && activeAgents.length === 1}
        >
          <View style={styles.agentInfo}>
            {/* The 'name' and 'description' are keys for translation */}
            <Text style={styles.agentName}>{t(agent.name, agent.name)}</Text>
            <Text style={styles.agentDescription}>{t(agent.description, agent.description)}</Text>
          </View>
          {activeAgentIds.has(agent.type) ? (
            <CheckCircle size={24} color={colors.primary} />
          ) : (
            <Circle size={24} color={colors.placeholder} />
          )}
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

// --- Styles remain the same ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: 16,
    color: colors.placeholder,
    marginTop: 4,
  },
  agentCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: 15,
    marginHorizontal: 10,
    marginTop: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  agentInfo: {
    flex: 1,
    marginRight: 10,
  },
  agentName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  agentDescription: {
    fontSize: 14,
    color: colors.placeholder,
    marginTop: 4,
  },
});
