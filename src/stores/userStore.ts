import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { userAPI } from '../services/api';

interface UserInfo {
  _id: string;
  name: string;
  whatsapp: string;
  deviceInfo?: {
    browser?: string;
    os?: string;
    platform?: string;
    screenResolution?: string;
    timezone?: string;
    language?: string;
  };
}

interface UserState {
  user: UserInfo | null;
  deviceFingerprint: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  setDeviceFingerprint: (fingerprint: string) => void;
  login: (whatsapp: string, name: string) => Promise<void>;
  logout: () => void;
  updateUser: (data: Partial<UserInfo>) => Promise<void>;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      deviceFingerprint: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      setDeviceFingerprint: (fingerprint) => {
        set({ deviceFingerprint: fingerprint });
      },

      login: async (whatsapp: string, name: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await userAPI.registerOrLogin(whatsapp, name);
          if (response.success) {
            set({
              user: response.data,
              isAuthenticated: true,
              isLoading: false,
            });
          }
        } catch (error: unknown) {
          const err = error as { message?: string };
          set({
            error: err.message || 'Login failed',
            isLoading: false,
          });
          throw error;
        }
      },

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          deviceFingerprint: null,
        });
      },

      updateUser: async (data: Partial<UserInfo>) => {
        set({ isLoading: true, error: null });
        try {
          const { user } = get();
          if (!user) throw new Error('User not authenticated');
          
          const response = await userAPI.update(user._id, data);
          if (response.success) {
            set({
              user: response.data,
              isLoading: false,
            });
          }
        } catch (error: unknown) {
          const err = error as { message?: string };
          set({
            error: err.message || 'Update failed',
            isLoading: false,
          });
          throw error;
        }
      },
    }),
    {
      name: 'user-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        deviceFingerprint: state.deviceFingerprint,
      }),
    }
  )
);
