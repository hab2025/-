import { useState, useEffect, createContext, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Theme, themes, ThemeName } from '@/constants/themes';
import { useColorScheme } from 'react-native';

interface ThemeContextType {
  theme: Theme;
  themeName: ThemeName;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (themeName: ThemeName) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [themeName, setThemeName] = useState<ThemeName>('light');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTheme();
  }, []);

  useEffect(() => {
    // Auto-switch to system theme if no preference is saved
    if (isLoading) return;
    
    const savedTheme = AsyncStorage.getItem('theme');
    if (!savedTheme && systemColorScheme) {
      setThemeName(systemColorScheme === 'dark' ? 'dark' : 'light');
    }
  }, [systemColorScheme, isLoading]);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme');
      if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
        setThemeName(savedTheme as ThemeName);
      } else {
        // Use system preference as default
        setThemeName(systemColorScheme === 'dark' ? 'dark' : 'light');
      }
    } catch (error) {
      console.error('Failed to load theme:', error);
      setThemeName('light');
    } finally {
      setIsLoading(false);
    }
  };

  const saveTheme = async (newTheme: ThemeName) => {
    try {
      await AsyncStorage.setItem('theme', newTheme);
    } catch (error) {
      console.error('Failed to save theme:', error);
    }
  };

  const setTheme = (newTheme: ThemeName) => {
    setThemeName(newTheme);
    saveTheme(newTheme);
  };

  const toggleTheme = () => {
    const newTheme = themeName === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };

  const theme = themes[themeName];
  const isDark = themeName === 'dark';

  const value: ThemeContextType = {
    theme,
    themeName,
    isDark,
    toggleTheme,
    setTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;

