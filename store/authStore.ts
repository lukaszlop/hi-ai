import * as SecureStore from "expo-secure-store";
import {create} from "zustand";
import {persist} from "zustand/middleware";
import type {AuthState} from "./types";

// Custom storage dla SecureStore
const secureStorage = {
  getItem: async (name: string): Promise<string | null> => {
    try {
      return await SecureStore.getItemAsync(name);
    } catch {
      return null;
    }
  },
  setItem: async (name: string, value: string): Promise<void> => {
    try {
      await SecureStore.setItemAsync(name, value);
    } catch {
      // Obsługa błędu SecureStore
    }
  },
  removeItem: async (name: string): Promise<void> => {
    try {
      await SecureStore.deleteItemAsync(name);
    } catch {
      // Obsługa błędu SecureStore
    }
  },
};

interface AuthStore extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  checkAuth: () => void;
}

const MOCK_EMAIL = "test@example.com";
const MOCK_PASSWORD = "password123";

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      isLoggedIn: false,
      credentials: undefined,

      login: async (email: string, password: string): Promise<boolean> => {
        // Mock logowanie zgodnie z PRD
        if (email === MOCK_EMAIL && password === MOCK_PASSWORD) {
          set({
            isLoggedIn: true,
            credentials: {email, password},
          });
          return true;
        }
        return false;
      },

      logout: () => {
        set({
          isLoggedIn: false,
          credentials: undefined,
        });
      },

      checkAuth: () => {
        const state = get();
        if (state.credentials) {
          const {email, password} = state.credentials;
          if (email === MOCK_EMAIL && password === MOCK_PASSWORD) {
            set({isLoggedIn: true});
          } else {
            set({isLoggedIn: false, credentials: undefined});
          }
        }
      },
    }),
    {
      name: "auth-store",
      storage: secureStorage,
    }
  )
);
