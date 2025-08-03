import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/auth-store';
import { useLanguage } from '@/hooks/language-store';
import Input from '@/components/Input';
import Button from '@/components/Button';
import { User, Lock } from 'lucide-react-native';
import colors from '@/constants/colors';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const router = useRouter();
  const { login } = useAuth();
  const { t, language, setLanguage } = useLanguage();

  const handleLogin = async () => {
    if (!username || !password) {
      setError(t('login.error', 'Invalid username or password'));
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const success = await login(username, password);
      if (success) {
        router.replace('/(tabs)');
      } else {
        setError(t('login.error', 'Invalid username or password'));
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(t('login.error', 'Invalid username or password'));
    } finally {
      setIsLoading(false);
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'ar' ? 'en' : 'ar');
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardAvoidingView}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container} testID="login-screen">
          <View style={styles.header}>
            <Text style={styles.title}>{t('app.title', 'AI Assistant')}</Text>
            <Text style={styles.subtitle}>{t('login.title', 'Login')}</Text>
          </View>

          <View style={styles.form}>
            <Input
              label={t('login.username', 'Username')}
              placeholder={t('login.username', 'Username')}
              value={username}
              onChangeText={setUsername}
              leftIcon={<User size={20} color={colors.placeholder} />}
              autoCapitalize="none"
              testID="username-input"
            />

            <Input
              label={t('login.password', 'Password')}
              placeholder={t('login.password', 'Password')}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              leftIcon={<Lock size={20} color={colors.placeholder} />}
              testID="password-input"
            />

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <Button
              title={t('login.submit', 'Login')}
              onPress={handleLogin}
              isLoading={isLoading}
              style={styles.loginButton}
              testID="login-button"
            />
          </View>

          <TouchableOpacity 
            style={styles.languageToggle} 
            onPress={toggleLanguage}
            testID="language-toggle"
          >
            <Text style={styles.languageText}>
              {language === 'ar' ? 'English' : 'العربية'}
            </Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: colors.background,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: colors.text,
    textAlign: 'center',
  },
  form: {
    marginBottom: 24,
  },
  errorText: {
    color: colors.error,
    marginBottom: 16,
    textAlign: 'center',
  },
  loginButton: {
    marginTop: 16,
  },
  languageToggle: {
    alignSelf: 'center',
    padding: 8,
    marginBottom: 16,
  },
  languageText: {
    color: colors.primary,
    fontSize: 16,
  },
  hint: {
    alignItems: 'center',
  },
  hintText: {
    color: colors.placeholder,
    fontSize: 12,
  },
});

