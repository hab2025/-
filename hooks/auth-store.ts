// hooks/auth-store.ts

import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User } from '@/types/auth';

interface AuthState {
  user: User | null;
  initialized: boolean; // To check if we have loaded the user from storage
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  _setInitialized: (value: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      initialized: false,

      login: async (username, password) => {
        if (username === 'admin' && password === 'Mo@1234567') {
          const user: User = { id: '1', username: 'admin', role: 'admin' };
          set({ user: user });
          return true;
        }
        return false;
      },

      logout: () => {
        set({ user: null });
      },

      _setInitialized: (value: boolean) => {
        set({ initialized: value });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist the 'user' object
      partialize: (state) => ({ user: state.user }),
      // This function runs after the state has been loaded from storage
      onRehydrateStorage: () => (state) => {
        if (state) {
          state._setInitialized(true);
        }
      },
    }
  )
);
