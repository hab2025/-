export interface Theme {
  name: string;
  colors: {
    // Primary colors
    primary: string;
    primaryDark: string;
    primaryLight: string;
    secondary: string;
    accent: string;
    
    // Background colors
    background: string;
    backgroundSecondary: string;
    surface: string;
    card: string;
    overlay: string;
    
    // Text colors
    text: string;
    textSecondary: string;
    textTertiary: string;
    textInverse: string;
    
    // Status colors
    success: string;
    warning: string;
    error: string;
    info: string;
    
    // Interactive colors
    border: string;
    borderFocus: string;
    placeholder: string;
    disabled: string;
    
    // Gradients
    gradientPrimary: string[];
    gradientSecondary: string[];
    gradientBackground: string[];
    
    // Shadows
    shadowLight: string;
    shadowMedium: string;
    shadowHeavy: string;
  };
  
  typography: {
    fontFamily: {
      regular: string;
      medium: string;
      semiBold: string;
      bold: string;
    };
    
    fontSize: {
      xs: number;
      sm: number;
      base: number;
      lg: number;
      xl: number;
      '2xl': number;
      '3xl': number;
      '4xl': number;
    };
    
    lineHeight: {
      tight: number;
      normal: number;
      relaxed: number;
    };
    
    letterSpacing: {
      tight: number;
      normal: number;
      wide: number;
    };
  };
  
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    '2xl': number;
    '3xl': number;
  };
  
  borderRadius: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
    full: number;
  };
  
  animation: {
    duration: {
      fast: number;
      normal: number;
      slow: number;
    };
    
    easing: {
      linear: string;
      easeIn: string;
      easeOut: string;
      easeInOut: string;
      bounce: string;
    };
  };
}

export const lightTheme: Theme = {
  name: 'light',
  colors: {
    // Primary colors
    primary: '#2563EB',
    primaryDark: '#1D4ED8',
    primaryLight: '#60A5FA',
    secondary: '#10B981',
    accent: '#F59E0B',
    
    // Background colors
    background: '#FFFFFF',
    backgroundSecondary: '#F8FAFC',
    surface: '#FFFFFF',
    card: '#FFFFFF',
    overlay: 'rgba(0, 0, 0, 0.5)',
    
    // Text colors
    text: '#1F2937',
    textSecondary: '#6B7280',
    textTertiary: '#9CA3AF',
    textInverse: '#FFFFFF',
    
    // Status colors
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
    
    // Interactive colors
    border: '#E5E7EB',
    borderFocus: '#2563EB',
    placeholder: '#9CA3AF',
    disabled: '#D1D5DB',
    
    // Gradients
    gradientPrimary: ['#2563EB', '#1D4ED8'],
    gradientSecondary: ['#10B981', '#059669'],
    gradientBackground: ['#F8FAFC', '#FFFFFF'],
    
    // Shadows
    shadowLight: 'rgba(0, 0, 0, 0.05)',
    shadowMedium: 'rgba(0, 0, 0, 0.1)',
    shadowHeavy: 'rgba(0, 0, 0, 0.25)',
  },
  
  typography: {
    fontFamily: {
      regular: 'System',
      medium: 'System',
      semiBold: 'System',
      bold: 'System',
    },
    
    fontSize: {
      xs: 12,
      sm: 14,
      base: 16,
      lg: 18,
      xl: 20,
      '2xl': 24,
      '3xl': 30,
      '4xl': 36,
    },
    
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.8,
    },
    
    letterSpacing: {
      tight: -0.5,
      normal: 0,
      wide: 0.5,
    },
  },
  
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    '2xl': 48,
    '3xl': 64,
  },
  
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
  },
  
  animation: {
    duration: {
      fast: 150,
      normal: 300,
      slow: 500,
    },
    
    easing: {
      linear: 'linear',
      easeIn: 'ease-in',
      easeOut: 'ease-out',
      easeInOut: 'ease-in-out',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    },
  },
};

export const darkTheme: Theme = {
  ...lightTheme,
  name: 'dark',
  colors: {
    // Primary colors
    primary: '#3B82F6',
    primaryDark: '#2563EB',
    primaryLight: '#60A5FA',
    secondary: '#10B981',
    accent: '#F59E0B',
    
    // Background colors
    background: '#0F172A',
    backgroundSecondary: '#1E293B',
    surface: '#1E293B',
    card: '#334155',
    overlay: 'rgba(0, 0, 0, 0.7)',
    
    // Text colors
    text: '#F1F5F9',
    textSecondary: '#CBD5E1',
    textTertiary: '#94A3B8',
    textInverse: '#0F172A',
    
    // Status colors
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
    
    // Interactive colors
    border: '#475569',
    borderFocus: '#3B82F6',
    placeholder: '#64748B',
    disabled: '#475569',
    
    // Gradients
    gradientPrimary: ['#3B82F6', '#2563EB'],
    gradientSecondary: ['#10B981', '#059669'],
    gradientBackground: ['#0F172A', '#1E293B'],
    
    // Shadows
    shadowLight: 'rgba(0, 0, 0, 0.2)',
    shadowMedium: 'rgba(0, 0, 0, 0.3)',
    shadowHeavy: 'rgba(0, 0, 0, 0.5)',
  },
};

export const themes = {
  light: lightTheme,
  dark: darkTheme,
};

export type ThemeName = keyof typeof themes;

