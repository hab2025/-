import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import colors from '@/constants/colors';
import { useLanguage } from '@/hooks/language-store';

interface ThoughtProcessProps {
  plan: string[];
  currentTool: string;
  thoughts: string;
}

const ThoughtProcess: React.FC<ThoughtProcessProps> = ({
  plan,
  currentTool,
  thoughts,
}) => {
  const { t } = useLanguage();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('thoughtProcess.title', 'Agent\'s Thought Process')}</Text>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('thoughtProcess.plan', 'Plan')}</Text>
        {plan.map((step, index) => (
          <Text key={index} style={styles.step}>{`- ${step}`}</Text>
        ))}
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('thoughtProcess.currentTool', 'Current Tool')}</Text>
        <Text style={styles.text}>{currentTool}</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('thoughtProcess.thoughts', 'Thoughts')}</Text>
        <Text style={styles.text}>{thoughts}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 10,
    padding: 10,
    marginVertical: 5,
    borderColor: colors.border,
    borderWidth: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 10,
  },
  section: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 5,
  },
  step: {
    fontSize: 14,
    color: colors.text,
    marginLeft: 10,
  },
  text: {
    fontSize: 14,
    color: colors.text,
  },
});

export default ThoughtProcess;
