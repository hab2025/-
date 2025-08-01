import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useLanguage } from '@/hooks/language-store';
import { useAgent } from '@/hooks/agent-store';
import { features, FeatureCategory } from '@/constants/features';
import FeatureCard from '@/components/FeatureCard';
import { getAllAgents } from '@/constants/agents';
import colors from '@/constants/colors';
import { Brain, Zap, Settings } from 'lucide-react-native';

export default function FeaturesScreen() {
  const { t } = useLanguage();
  const { getActiveAgents, activateAgent, deactivateAgent } = useAgent();
  const allAgents = getAllAgents();
  const activeAgents = getActiveAgents();
  const [selectedCategory, setSelectedCategory] = useState<FeatureCategory>('general');

  const categories: { id: FeatureCategory; title: string }[] = [
    { id: 'general', title: t('features.general', 'General Capabilities') },
    { id: 'content', title: t('features.content', 'Creative Content') },
    { id: 'media', title: t('features.media', 'Multimedia Analysis') },
    { id: 'special', title: t('features.special', 'Special Capabilities') },
    { id: 'files', title: t('features.files', 'File Management') },
  ];

  const filteredFeatures = features.filter(
    feature => feature.category === selectedCategory
  );

  const handleFeaturePress = async (featureId: string) => {
    switch (featureId) {
      case 'image-generation':
        await handleImageGeneration();
        break;
      case 'web-search':
        Alert.alert('البحث على الإنترنت', 'اذهب إلى الشات واطلب مني البحث عن أي موضوع');
        break;
      case 'image-analysis':
        Alert.alert('تحليل الصور', 'اذهب إلى الشات وارسل صورة لتحليلها');
        break;
      case 'audio-transcription':
        Alert.alert('نسخ الصوت', 'اذهب إلى الشات واضغط على زر الميكروفون للتسجيل');
        break;
      default:
        Alert.alert(
          'ميزة متاحة',
          `هذه الميزة (${featureId}) متاحة في الشات. اطلبها مني مباشرة!`
        );
    }
  };

  const handleAgentToggle = (agentType: string) => {
    const isActive = activeAgents.some(agent => agent.type === agentType);
    if (isActive && agentType !== 'general') {
      deactivateAgent(agentType as any);
    } else {
      activateAgent(agentType as any);
    }
  };

  const handleImageGeneration = async () => {
    Alert.prompt(
      'إنشاء صورة',
      'صف الصورة التي تريد إنشاءها:',
      [
        {
          text: 'إلغاء',
          style: 'cancel'
        },
        {
          text: 'إنشاء',
          onPress: async (prompt) => {
            if (!prompt?.trim()) return;
            
            try {
              const response = await fetch('https://toolkit.rork.com/images/generate/', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  prompt: prompt,
                  size: '1024x1024'
                })
              });

              if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
              }

              const data = await response.json();
              
              if (data.image && data.image.base64Data) {
                Alert.alert('تم إنشاء الصورة!', 'تم إنشاء الصورة بنجاح. يمكنك رؤيتها في الشات.');
              } else {
                throw new Error('No image data received');
              }             } catch (error) {
              console.error('Image generation error:', error);
              Alert.alert('خطأ', 'فشل في إنشاء الصورة. يرجى المحاولة مرة أخرى.');
            }
          }
        }
      ],
      'plain-text'
    );
  };

  return (
    <ScrollView style={styles.container} testID="features-screen">
      <View style={styles.header}>
        <Text style={styles.title}>🤖 سوبر إيجنت</Text>
        <Text style={styles.subtitle}>مساعدك الذكي بدون قيود</Text>
      </View>
      
      {/* Active Agents Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Brain size={20} color={colors.primary} />
          <Text style={styles.sectionTitle}>الوكلاء النشطون ({activeAgents.length})</Text>
        </View>
        <View style={styles.activeAgentsContainer}>
          {activeAgents.map((agent) => (
            <View key={agent.type} style={[styles.activeAgentChip, { borderColor: agent.color }]}>
              <Text style={styles.activeAgentEmoji}>{agent.icon}</Text>
              <Text style={styles.activeAgentName}>{agent.name}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* All Agents Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Settings size={20} color={colors.primary} />
          <Text style={styles.sectionTitle}>جميع الوكلاء المتاحين</Text>
        </View>
        <View style={styles.agentsGrid}>
          {allAgents.map((agent) => {
            const isActive = activeAgents.some(a => a.type === agent.type);
            const isGeneral = agent.type === 'general';
            
            return (
              <TouchableOpacity
                key={agent.type}
                style={[
                  styles.agentCard,
                  isActive && styles.activeAgentCard,
                  { borderColor: agent.color }
                ]}
                onPress={() => handleAgentToggle(agent.type)}
                disabled={isGeneral}
              >
                <View style={styles.agentHeader}>
                  <Text style={styles.agentEmoji}>{agent.icon}</Text>
                  {isActive && <Zap size={16} color={agent.color} />}
                </View>
                <Text style={[styles.agentName, isActive && { color: agent.color }]}>
                  {agent.name}
                </Text>
                <Text style={styles.agentDescription}>
                  {agent.description}
                </Text>
                <View style={styles.capabilitiesContainer}>
                  {agent.capabilities.slice(0, 3).map((capability, index) => (
                    <Text key={index} style={styles.capability}>
                      • {capability}
                    </Text>
                  ))}
                  {agent.capabilities.length > 3 && (
                    <Text style={styles.moreCapabilities}>
                      +{agent.capabilities.length - 3} مزيد
                    </Text>
                  )}
                </View>
                {isGeneral && (
                  <Text style={styles.alwaysActiveLabel}>
                    نشط دائماً
                  </Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Categories and Features */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>الميزات الإضافية</Text>
        </View>
        
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
        >
          {categories.map(category => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryButton,
                selectedCategory === category.id && styles.selectedCategory
              ]}
              onPress={() => setSelectedCategory(category.id)}
              testID={`category-${category.id}`}
            >
              <Text 
                style={[
                  styles.categoryText,
                  selectedCategory === category.id && styles.selectedCategoryText
                ]}
              >
                {category.title}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.featuresContent}>
          {filteredFeatures.map(feature => (
            <FeatureCard
              key={feature.id}
              feature={feature}
              onPress={() => handleFeaturePress(feature.id)}
            />
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: colors.placeholder,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 8,
  },
  activeAgentsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 8,
  },
  activeAgentChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  activeAgentEmoji: {
    fontSize: 14,
    marginRight: 6,
  },
  activeAgentName: {
    fontSize: 12,
    color: colors.text,
    fontWeight: '500',
  },
  agentsGrid: {
    paddingHorizontal: 16,
    gap: 12,
  },
  agentCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  activeAgentCard: {
    backgroundColor: 'rgba(37, 99, 235, 0.05)',
    borderWidth: 2,
  },
  agentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  agentEmoji: {
    fontSize: 24,
  },
  agentName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  agentDescription: {
    fontSize: 14,
    color: colors.placeholder,
    marginBottom: 12,
    lineHeight: 20,
  },
  capabilitiesContainer: {
    marginBottom: 8,
  },
  capability: {
    fontSize: 12,
    color: colors.text,
    marginBottom: 2,
  },
  moreCapabilities: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '500',
    marginTop: 4,
  },
  alwaysActiveLabel: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
    borderRadius: 6,
  },
  categoriesContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  selectedCategory: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryText: {
    fontSize: 14,
    color: colors.text,
  },
  selectedCategoryText: {
    color: colors.lightText,
    fontWeight: '500',
  },
  featuresContent: {
    padding: 16,
    paddingBottom: 32,
  },
});

