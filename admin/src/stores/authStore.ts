import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserResponse } from '../types';
import { auth } from '../services/auth';

interface AuthState {
  user: UserResponse | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: () => boolean;
  isAdmin: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: auth.getUser(),
      token: auth.getToken(),

      login: async (email: string, password: string) => {
        const data = await auth.login(email, password);
        auth.setTokens(data);
        const newState = {
          token: data.accessToken,
          user: data.user || null,
        };
        console.log('AuthStore: Setting state after login:', newState);
        set(newState);
      },

      logout: () => {
        auth.logout();
        set({ user: null, token: null });
      },

      isAuthenticated: () => {
        return !!get().token && auth.isAuthenticated();
      },

      isAdmin: () => {
        // 直接从 Zustand state 获取 user，避免调用 auth.isAdmin 时的 localStorage 时序问题
        const user = get().user;
        return user?.role === 'ADMIN';
      },
    }),
    {
      name: 'callit-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
      }),
    }
  )
);
