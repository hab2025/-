import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect } from 'react';
import { User, AuthState } from '@/types/auth';

export const [AuthContext, useAuth] = createContextHook(() => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userJson = await AsyncStorage.getItem('user');
      if (userJson) {
        const user = JSON.parse(userJson) as User;
        setState({ user, isAuthenticated: true, isLoading: false });
      } else {
        setState({ user: null, isAuthenticated: false, isLoading: false });
      }
    } catch (error) {
      console.error('Failed to load user:', error);
      setState({ user: null, isAuthenticated: false, isLoading: false });
    }
  };

  const login = async (username: string, password: string) => {
    // For testing purposes, hardcoded admin credentials
    if (username === 'admin' && password === 'Mo@1234567') {
      const user: User = {
        id: '1',
        username: 'admin',
        role: 'admin',
      };
      
      await AsyncStorage.setItem('user', JSON.stringify(user));
      setState({ user, isAuthenticated: true, isLoading: false });
      return true;
    }
    return false;
  };

  const logout = async () => {
    await AsyncStorage.removeItem('user');
    setState({ user: null, isAuthenticated: false, isLoading: false });
  };

  return {
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    login,
    logout,
  };
});

