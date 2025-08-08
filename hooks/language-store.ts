// hooks/language-store.ts

import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect } from 'react';

export type Language = 'ar' | 'en';

interface LanguageState {
  language: Language;
  isLoaded: boolean; // <-- ADD THIS NEW STATE
  setLanguage: (lang: Language) => Promise<void>;
  t: (key: string, fallback?: string) => string;
}

// ... (The entire 'translations' object remains exactly the same, so I'm omitting it for brevity)
const translations = {
  ar: { /* ... all your Arabic translations ... */ },
  en: { /* ... all your English translations ... */ },
};


export const [LanguageContext, useLanguage] = createContextHook((): LanguageState => {
  const [language, setLanguageState] = useState<Language>('ar');
  const [isLoaded, setLoaded] = useState(false); // <-- State to track loading

  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const storedLanguage = await AsyncStorage.getItem('language');
        if (storedLanguage === 'ar' || storedLanguage === 'en') {
          setLanguageState(storedLanguage);
        }
      } catch (error) {
        console.error('Failed to load language preference:', error);
      } finally {
        setLoaded(true); // <-- Mark as loaded, regardless of success or failure
      }
    };
    loadLanguage();
  }, []);

  const setLanguage = async (lang: Language) => {
    try {
      await AsyncStorage.setItem('language', lang);
      setLanguageState(lang);
    } catch (error) {
      console.error('Failed to save language preference:', error);
    }
  };

  const t = (key: string, fallback?: string): string => {
    const langKey = language as keyof typeof translations;
    const translationKey = key as keyof typeof translations[typeof langKey];
    return translations[langKey][translationKey] || fallback || key;
  };

  return {
    language,
    isLoaded, // <-- Expose the loading state
    setLanguage,
    t,
  };
});
