import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import { useAuth } from '@/hooks/auth-store';
import { useLanguage, Language } from '@/hooks/language-store';
import { LogOut, Globe, User, Settings as SettingsIcon, Info, Shield, Bell } from 'lucide-react-native';
import colors from '@/constants/colors';

export default function SettingsScreen() {
  const { user, logout } = useAuth();
  const { t, language, setLanguage } = useLanguage();

  const handleLogout = () => {
    Alert.alert(
      t('settings.logout', 'Logout'),
      'هل أنت متأكد أنك تريد تسجيل الخروج؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        { text: t('settings.logout', 'Logout'), onPress: logout, style: 'destructive' },
      ]
    );
  };

  const handleLanguageToggle = async (newLanguage: Language) => {
    await setLanguage(newLanguage);
  };

  const settingsItems = [
    {
      id: 'profile',
      title: 'الملف الشخصي',
      subtitle: user?.username || 'غير محدد',
      icon: <User size={24} color={colors.primary} />,
      onPress: () => Alert.alert('الملف الشخصي', 'ميزة قيد التطوير'),
    },
    {
      id: 'language',
      title: t('settings.language', 'Language'),
      subtitle: language === 'ar' ? 'العربية' : 'English',
      icon: <Globe size={24} color={colors.primary} />,
      onPress: () => {
        Alert.alert(
          'اختر اللغة',
          'Choose Language',
          [
            { text: 'العربية', onPress: () => handleLanguageToggle('ar') },
            { text: 'English', onPress: () => handleLanguageToggle('en') },
            { text: 'إلغاء / Cancel', style: 'cancel' },
          ]
        );
      },
    },
    {
      id: 'notifications',
      title: 'الإشعارات',
      subtitle: 'إدارة الإشعارات والتنبيهات',
      icon: <Bell size={24} color={colors.primary} />,
      onPress: () => Alert.alert('الإشعارات', 'ميزة قيد التطوير'),
    },
    {
      id: 'privacy',
      title: 'الخصوصية والأمان',
      subtitle: 'إعدادات الخصوصية والحماية',
      icon: <Shield size={24} color={colors.primary} />,
      onPress: () => Alert.alert('الخصوصية', 'ميزة قيد التطوير'),
    },
    {
      id: 'about',
      title: 'حول التطبيق',
      subtitle: 'معلومات التطبيق والإصدار',
      icon: <Info size={24} color={colors.primary} />,
      onPress: () => Alert.alert(
        'حول التطبيق',
        'مساعد الذكاء الاصطناعي\nالإصدار 1.0.0\n\nتطبيق ذكي متقدم يوفر مساعدة شاملة في مختلف المجالات باستخدام تقنيات الذكاء الاصطناعي المتطورة.'
      ),
    },
  ];

  const renderSettingItem = (item: typeof settingsItems[0]) => (
    <TouchableOpacity
      key={item.id}
      style={styles.settingItem}
      onPress={item.onPress}
      testID={`setting-${item.id}`}
    >
      <View style={styles.settingIcon}>
        {item.icon}
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{item.title}</Text>
        <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
      </View>
      <View style={styles.settingArrow}>
        <Text style={styles.arrowText}>›</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} testID="settings-screen">
      <View style={styles.header}>
        <SettingsIcon size={32} color={colors.primary} />
        <Text style={styles.headerTitle}>{t('settings.title', 'Settings')}</Text>
        <Text style={styles.headerSubtitle}>إدارة إعدادات التطبيق والحساب</Text>
      </View>

      <View style={styles.userSection}>
        <View style={styles.userAvatar}>
          <User size={40} color={colors.lightText} />
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{user?.username || 'المستخدم'}</Text>
          <Text style={styles.userRole}>
            {user?.role === 'admin' ? 'مدير النظام' : 'مستخدم'}
          </Text>
        </View>
      </View>

      <View style={styles.settingsSection}>
        <Text style={styles.sectionTitle}>الإعدادات العامة</Text>
        {settingsItems.map(renderSettingItem)}
      </View>

      <View style={styles.dangerSection}>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          testID="logout-button"
        >
          <LogOut size={24} color={colors.error} />
          <Text style={styles.logoutText}>{t('settings.logout', 'Logout')}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          مساعد الذكاء الاصطناعي v1.0.0
        </Text>
        <Text style={styles.footerSubtext}>
          تم التطوير بواسطة فريق التطوير
        </Text>
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
    alignItems: 'center',
    padding: 24,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 12,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.placeholder,
    textAlign: 'center',
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: colors.card,
    marginTop: 12,
    marginHorizontal: 16,
    borderRadius: 12,
  },
  userAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  userRole: {
    fontSize: 14,
    color: colors.placeholder,
  },
  settingsSection: {
    marginTop: 24,
    marginHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
    marginLeft: 4,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: colors.placeholder,
  },
  settingArrow: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowText: {
    fontSize: 20,
    color: colors.placeholder,
    fontWeight: '300',
  },
  dangerSection: {
    marginTop: 32,
    marginHorizontal: 16,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.error,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.error,
    marginLeft: 8,
  },
  footer: {
    alignItems: 'center',
    padding: 32,
    marginTop: 24,
  },
  footerText: {
    fontSize: 14,
    color: colors.placeholder,
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 12,
    color: colors.placeholder,
  },
});

