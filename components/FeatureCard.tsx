import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import colors from '@/constants/colors';
import { useLanguage } from '@/hooks/language-store';

export interface Feature {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'general' | 'content' | 'media' | 'special' | 'files';
  isAvailable: boolean;
}

interface FeatureCardProps {
  feature: Feature;
  onPress: () => void;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ feature, onPress }) => {
  const { t } = useLanguage();

  return (
    <TouchableOpacity
      style={[
        styles.container,
        !feature.isAvailable && styles.disabledContainer,
      ]}
      onPress={onPress}
      disabled={!feature.isAvailable}
      testID={`feature-${feature.id}`}
    >
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{feature.icon}</Text>
      </View>
      
      <View style={styles.content}>
        <Text style={[
          styles.title,
          !feature.isAvailable && styles.disabledText,
        ]}>
          {feature.title}
        </Text>
        <Text style={[
          styles.description,
          !feature.isAvailable && styles.disabledText,
        ]}>
          {feature.description}
        </Text>
        
        {!feature.isAvailable && (
          <View style={styles.comingSoonBadge}>
            <Text style={styles.comingSoonText}>{t('features.comingSoon', 'Coming Soon')}</Text>
          </View>
        )}
      </View>
      
      <View style={styles.arrow}>
        <ChevronRight 
          size={20} 
          color={feature.isAvailable ? colors.placeholder : colors.inactive} 
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.darkOverlay,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  disabledContainer: {
    opacity: 0.6,
    backgroundColor: colors.background,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  icon: {
    fontSize: 24,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: colors.placeholder,
    lineHeight: 20,
  },
  disabledText: {
    color: colors.inactive,
  },
  comingSoonBadge: {
    backgroundColor: colors.warning,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  comingSoonText: {
    fontSize: 12,
    color: colors.lightText,
    fontWeight: '500',
  },
  arrow: {
    marginLeft: 8,
  },
});

export default FeatureCard;

