/**
 * Settings store - Persisted app settings with Zustand
 *
 * Uses Zustand's `persist` middleware with AsyncStorage as the storage backend
 * to persist user preferences (currently just theme mode) across app restarts.
 *
 * The store is keyed under `'starter-settings'` in AsyncStorage.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
// TODO: Import from '@sudobility/mogulgame_types' once ^0.0.20 is published
// import type { CountryCode } from '@sudobility/mogulgame_types';
export type CountryCode = 'US' | 'CA' | 'GB' | 'AE' | 'ES' | 'AU';

/** The user's preferred colour scheme. `'system'` follows the OS setting. */
export type ThemeMode = 'system' | 'light' | 'dark';

/** Shape of the settings Zustand store. */
interface SettingsState {
  /** The current theme mode preference. */
  theme: ThemeMode;
  /** The selected country for multi-country support. */
  selectedCountry: CountryCode;
  /** Update the theme mode preference and persist it. */
  setTheme: (theme: ThemeMode) => void;
  /** Update the selected country and persist it. */
  setSelectedCountry: (country: CountryCode) => void;
  /** Reset all settings to their initial defaults. */
  reset: () => void;
}

/** Default values for all settings fields. */
const initialState = {
  theme: 'system' as ThemeMode,
  selectedCountry: 'US' as CountryCode,
};

/**
 * Zustand store hook for app settings.
 *
 * Settings are automatically persisted to AsyncStorage under the key
 * `'starter-settings'` and rehydrated on app launch.
 *
 * @example
 * ```ts
 * const { theme, setTheme } = useSettingsStore();
 * setTheme('dark');
 * ```
 */
export const useSettingsStore = create<SettingsState>()(
  persist(
    set => ({
      ...initialState,
      setTheme: theme => set({ theme }),
      setSelectedCountry: selectedCountry => set({ selectedCountry }),
      reset: () => set(initialState),
    }),
    {
      name: 'starter-settings',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
