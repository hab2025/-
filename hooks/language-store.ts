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
    'notFound.title': 'عفوا!',
    'notFound.message': 'هذه الشاشة غير موجودة.',
    'notFound.link': 'الذهاب إلى الشاشة الرئيسية!',
    'settings.logoutConfirm': 'هل أنت متأكد أنك تريد تسجيل الخروج؟',
    'settings.cancel': 'إلغاء',
    'settings.profile.title': 'الملف الشخصي',
    'settings.profile.notSet': 'غير محدد',
    'settings.wip': 'ميزة قيد التطوير',
    'settings.languageSelect': 'اختر اللغة',
    'settings.languageAr': 'العربية',
    'settings.languageEn': 'English',
    'settings.notifications.title': 'الإشعارات',
    'settings.notifications.subtitle': 'إدارة الإشعارات والتنبيهات',
    'settings.privacy.title': 'الخصوصية والأمان',
    'settings.privacy.subtitle': 'إعدادات الخصوصية والحماية',
    'settings.about.title': 'حول التطبيق',
    'settings.about.subtitle': 'معلومات التطبيق والإصدار',
    'settings.about.description': 'مساعد الذكاء الاصطناعي\nالإصدار 1.0.0\n\nتطبيق ذكي متقدم يوفر مساعدة شاملة في مختلف المجالات باستخدام تقنيات الذكاء الاصطناعي المتطورة.',
    'settings.header.subtitle': 'إدارة إعدادات التطبيق والحساب',
    'settings.user.defaultName': 'المستخدم',
    'settings.user.admin': 'مدير النظام',
    'settings.user.user': 'مستخدم',
    'settings.general': 'الإعدادات العامة',
    'settings.footer.developedBy': 'تم التطوير بواسطة فريق التطوير',
    'chat.deleteSession.title': 'حذف المحادثة',
    'chat.deleteSession.message': 'هل أنت متأكد أنك تريد حذف هذه المحادثة؟',
    'chat.deleteSession.cancel': 'إلغاء',
    'chat.deleteSession.delete': 'حذف',
    'chat.permissions.mediaLibrary.title': 'الإذن مطلوب',
    'chat.permissions.mediaLibrary.message': 'يرجى منح أذونات مكتبة الوسائط لاختيار صورة.',
    'chat.errors.readDocument.title': 'خطأ',
    'chat.errors.readDocument.message': 'تعذر قراءة المستند المحدد.',
    'chat.permissions.microphone.title': 'الإذن مطلوب',
    'chat.permissions.microphone.message': 'يرجى منح أذونات الميكروفون لتسجيل الصوت.',
    'chat.errors.startRecording.title': 'خطأ في التسجيل',
    'chat.errors.startRecording.message': 'فشل بدء التسجيل. يرجى المحاولة مرة أخرى.',
    'chat.errors.getRecordingUri.title': 'خطأ في التسجيل',
    'chat.errors.getRecordingUri.message': 'فشل في الحصول على URI التسجيل.',
    'chat.errors.stopRecording.title': 'خطأ في التسجيل',
    'chat.errors.stopRecording.message': 'فشل إيقاف التسجيل. يرجى المحاولة مرة أخرى.',
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
    'notFound.title': 'Oops!',
    'notFound.message': 'This screen doesn\'t exist.',
    'notFound.link': 'Go to home screen!',
    'settings.logoutConfirm': 'Are you sure you want to log out?',
    'settings.cancel': 'Cancel',
    'settings.profile.title': 'Profile',
    'settings.profile.notSet': 'Not set',
    'settings.wip': 'Feature in development',
    'settings.languageSelect': 'Choose Language',
    'settings.languageAr': 'العربية',
    'settings.languageEn': 'English',
    'settings.notifications.title': 'Notifications',
    'settings.notifications.subtitle': 'Manage notifications and alerts',
    'settings.privacy.title': 'Privacy and Security',
    'settings.privacy.subtitle': 'Privacy and security settings',
    'settings.about.title': 'About the App',
    'settings.about.subtitle': 'App information and version',
    'settings.about.description': 'AI Assistant\nVersion 1.0.0\n\nAn advanced smart application that provides comprehensive assistance in various fields using advanced artificial intelligence technologies.',
    'settings.header.subtitle': 'Manage app and account settings',
    'settings.user.defaultName': 'User',
    'settings.user.admin': 'System Administrator',
    'settings.user.user': 'User',
    'settings.general': 'General Settings',
    'settings.footer.developedBy': 'Developed by the development team',
    'chat.deleteSession.title': 'Delete Conversation',
    'chat.deleteSession.message': 'Are you sure you want to delete this conversation?',
    'chat.deleteSession.cancel': 'Cancel',
    'chat.deleteSession.delete': 'Delete',
    'chat.permissions.mediaLibrary.title': 'Permission required',
    'chat.permissions.mediaLibrary.message': 'Please grant media library permissions to pick an image.',
    'chat.errors.readDocument.title': 'Error',
    'chat.errors.readDocument.message': 'Could not read the selected document.',
    'chat.permissions.microphone.title': 'Permission required',
    'chat.permissions.microphone.message': 'Please grant microphone permissions to record audio.',
    'chat.errors.startRecording.title': 'Recording Error',
    'chat.errors.startRecording.message': 'Failed to start recording. Please try again.',
    'chat.errors.getRecordingUri.title': 'Recording Error',
    'chat.errors.getRecordingUri.message': 'Failed to get recording URI.',
    'chat.errors.stopRecording.title': 'Recording Error',
    'chat.errors.stopRecording.message': 'Failed to stop recording. Please try again.',
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

