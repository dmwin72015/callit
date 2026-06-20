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
        set({ token: data.access_token });
      },

      logout: () => {
        auth.logout();
        set({ user: null, token: null });
      },

      isAuthenticated: () => {
        return !!get().token && auth.isAuthenticated();
      },

      isAdmin: () => {
        return auth.isAdmin(get().user);
      },
    }),
    {
      name: 'cnalias-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
      }),
    }
  )
);
