// app/(tabs)/settings.tsx

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { useAuthStore } from '@/hooks/auth-store';
import { useLanguage } from '@/hooks/language-store';
import colors from '@/constants/colors';
import { LogOut, User, Bell, Shield, Info, Globe } from 'lucide-react-native';

// --- THIS IS THE FIX: Define the types for the component's props ---
interface SettingItemProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string; // Subtitle is optional
  onPress: () => void;
  isDestructive?: boolean; // isDestructive is optional
}

// --- THIS IS THE FIX: Apply the types to the component ---
const SettingItem: React.FC<SettingItemProps> = ({ icon, title, subtitle, onPress, isDestructive = false }) => (
  <TouchableOpacity style={styles.itemContainer} onPress={onPress}>
    <View style={styles.iconContainer}>{icon}</View>
    <View style={styles.textContainer}>
      <Text style={[styles.itemTitle, isDestructive && styles.destructiveText]}>{title}</Text>
      {subtitle && <Text style={styles.itemSubtitle}>{subtitle}</Text>}
    </View>
  </TouchableOpacity>
);

export default function SettingsScreen() {
  const { user, logout } = useAuthStore();
  const { t, language, setLanguage } = useLanguage();

  const handleLogout = () => {
    Alert.alert(
      t('settings.logout', 'Logout'),
      t('settings.logoutConfirm', 'Are you sure you want to log out?'),
      [
        { text: t('settings.cancel', 'Cancel'), style: 'cancel' },
        { text: t('settings.logout', 'Logout'), onPress: logout, style: 'destructive' },
      ]
    );
  };

  const toggleLanguage = () => {
    const newLang = language === 'ar' ? 'en' : 'ar';
    setLanguage(newLang);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <User size={40} color={colors.primary} />
        {/* --- THIS IS THE FIX: Use user.username instead of user.name --- */}
        <Text style={styles.headerTitle}>{user?.username || t('settings.user.defaultName', 'User')}</Text>
        <Text style={styles.headerSubtitle}>{t('settings.header.subtitle', 'Manage app and account settings')}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('settings.general', 'General Settings')}</Text>
        <SettingItem
          icon={<Globe size={24} color={colors.text} />}
          title={t('settings.language', 'Language')}
          subtitle={language === 'ar' ? 'العربية' : 'English'}
          onPress={toggleLanguage}
        />
        <SettingItem
          icon={<Bell size={24} color={colors.text} />}
          title={t('settings.notifications.title', 'Notifications')}
          subtitle={t('settings.notifications.subtitle', 'Manage notifications and alerts')}
          onPress={() => Alert.alert(t('settings.wip', 'Feature in development'))}
        />
        <SettingItem
          icon={<Shield size={24} color={colors.text} />}
          title={t('settings.privacy.title', 'Privacy and Security')}
          subtitle={t('settings.privacy.subtitle', 'Privacy and security settings')}
          onPress={() => Alert.alert(t('settings.wip', 'Feature in development'))}
        />
      </View>

      <View style={styles.section}>
        <SettingItem
          icon={<Info size={24} color={colors.text} />}
          title={t('settings.about.title', 'About the App')}
          subtitle={t('settings.about.subtitle', 'App information and version')}
          onPress={() => Alert.alert(t('settings.about.title'), t('settings.about.description'))}
        />
      </View>

      <View style={styles.section}>
        <SettingItem
          icon={<LogOut size={24} color={'red'} />}
          title={t('settings.logout', 'Logout')}
          onPress={handleLogout}
          isDestructive
        />
      </View>
    </ScrollView>
  );
}

// --- Styles remain the same ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    backgroundColor: colors.card,
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: colors.text, marginTop: 10 },
  headerSubtitle: { fontSize: 14, color: colors.placeholder, marginTop: 5 },
  section: { marginTop: 20, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.card },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    paddingHorizontal: 15,
    paddingTop: 15,
    paddingBottom: 5,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  textContainer: { flex: 1 },
  itemTitle: { fontSize: 16, color: colors.text },
  itemSubtitle: { fontSize: 12, color: colors.placeholder, marginTop: 2 },
  destructiveText: { color: 'red' },
});
