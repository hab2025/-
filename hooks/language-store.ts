import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect } from 'react';

export type Language = 'ar' | 'en';

interface LanguageState {
  language: Language;
  setLanguage: (lang: Language) => Promise<void>;
  t: (key: string, fallback?: string) => string;
}

const translations = {
  ar: {
    'app.title': 'مساعد الذكاء الاصطناعي',
    'login.title': 'تسجيل الدخول',
    'login.username': 'اسم المستخدم',
    'login.password': 'كلمة المرور',
    'login.submit': 'دخول',
    'login.error': 'اسم المستخدم أو كلمة المرور غير صحيحة',
    'chat.newChat': 'محادثة جديدة',
    'chat.placeholder': 'اكتب رسالتك هنا...',
    'chat.send': 'إرسال',
    'settings.title': 'الإعدادات',
    'settings.language': 'اللغة',
    'settings.logout': 'تسجيل الخروج',
    'features.title': 'الميزات',
    'features.general': 'القدرات العامة',
    'features.content': 'إنشاء المحتوى الإبداعي',
    'features.media': 'تحليل وسائط المتعددة',
    'features.special': 'قدرات خاصة',
    'features.files': 'إدارة الملفات',
  },
  en: {
    'app.title': 'AI Assistant',
    'login.title': 'Login',
    'login.username': 'Username',
    'login.password': 'Password',
    'login.submit': 'Login',
    'login.error': 'Invalid username or password',
    'chat.newChat': 'New Chat',
    'chat.placeholder': 'Type your message here...',
    'chat.send': 'Send',
    'settings.title': 'Settings',
    'settings.language': 'Language',
    'settings.logout': 'Logout',
    'features.title': 'Features',
    'features.general': 'General Capabilities',
    'features.content': 'Creative Content Generation',
    'features.media': 'Multimedia Analysis',
    'features.special': 'Special Capabilities',
    'features.files': 'File Management',
  },
};

export const [LanguageContext, useLanguage] = createContextHook(() => {
  const [language, setLanguageState] = useState<Language>('ar');

  useEffect(() => {
    loadLanguage();
  }, []);

  const loadLanguage = async () => {
    try {
      const storedLanguage = await AsyncStorage.getItem('language');
      if (storedLanguage === 'ar' || storedLanguage === 'en') {
        setLanguageState(storedLanguage);
      }
    } catch (error) {
      console.error('Failed to load language preference:', error);
    }
  };

  const setLanguage = async (lang: Language) => {
    try {
      await AsyncStorage.setItem('language', lang);
      setLanguageState(lang);
    } catch (error) {
      console.error('Failed to save language preference:', error);
    }
  };

  const t = (key: string, fallback?: string): string => {
    return translations[language][key as keyof typeof translations['en']] || fallback || key;
  };

  return {
    language,
    setLanguage,
    t,
  };
});

