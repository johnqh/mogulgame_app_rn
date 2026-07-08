# MogulGame App RN

React Native application for the MogulGame project. Runs on **iOS, Android, macOS, and Windows**.

**Package**: `mogulgame_app_rn` (private)

> **Status: this is still a lightly-modified starter template.** No MogulGame domain logic has landed
> yet. There is exactly **one tab** (Settings) and **two screens** (`SettingsScreen`, `SplashScreen`).
> `@sudobility/mogulgame_client`, `mogulgame_lib`, and `mogulgame_types` are all installed but have
> **zero import sites** in `src/`. Expect starter residue throughout: `displayName: "Starter App"`,
> `repository` pointing at `starter_app_rn.git`, Xcode targets named `StarterApp`, Android package
> `com.sudobility.starter`, zustand persist key `starter-settings`, storage keys `@starter/*`, and a
> `"S"` sidebar logo.

## Tech Stack

- **Language**: TypeScript (JSX)
- **Runtime**: Bare React Native 0.81 + Expo SDK ~54 modules (**not** Expo-managed, **not** Expo Router)
- **Package Manager**: Bun (do not use npm/yarn/pnpm for installing dependencies)
- **Navigation**: React Navigation 7 (Bottom Tabs on mobile; custom sidebar on desktop)
- **State**: Zustand 5 (one store)
- **Data Fetching**: TanStack Query 5
- **Styling**: NativeWind 4 + Tailwind 3
- **Auth**: Firebase (native SDK on mobile, JS SDK + WebAuth PKCE on desktop), Google Sign-In
- **Test**: Jest (**not** Vitest)

## Project Structure

```
index.ts                              # AppRegistry.registerComponent — bare RN entry
App.tsx                               # Provider stack + two splash gates
src/
├── analytics.ts                      # Thin wrappers over getAnalytics() from @/di
├── components/
│   ├── AuthModal.tsx                 # Google + email/password sign-in modal
│   ├── GoogleIcon.tsx                # Brand SVG (intentional hardcoded colors)
│   └── ThemeVarsProvider.tsx         # Applies NativeWind vars() on a wrapping View
├── config/
│   ├── constants.ts                  # APP_NAME, SUPPORTED_LANGUAGES (15), STORAGE_KEYS, TAB_NAMES
│   ├── env.ts                        # THE only place process.env is read
│   ├── theme.ts                      # React Navigation light/dark themes
│   ├── themeVars.ts                  # NativeWind vars() from design tokens
│   └── designTheme.ts                # configureTheme() + cssInterop(Svg)
├── context/
│   ├── ApiContext.tsx                # Hand-rolled fetch NetworkClient + 401 refresh-and-retry
│   ├── AuthContext.tsx               # DESKTOP variant (auth_lib/auth-js + WebAuth PKCE)
│   ├── AuthContext.ios.tsx           # iOS (auth_lib/auth-native + native GoogleSignin)
│   └── AuthContext.android.tsx       # Android (same body as .ios)
├── di/
│   ├── initializeServices.ts         # DESKTOP variant — no-ops, returns null
│   ├── initializeServices.ios.ts     # initializeRNApp + initializeFirebaseAuth
│   └── initializeServices.android.ts
├── hooks/
│   ├── useAppColors.ts
│   ├── useTabBarHeight.ts            # DESKTOP variant — returns 0
│   ├── useTabBarHeight.ios.ts
│   └── useTabBarHeight.android.ts
├── i18n/index.ts                     # i18next + device locale + AsyncStorage persistence
├── navigation/
│   ├── AppNavigator.tsx              # Branches DesktopNavigator vs MobileNavigator
│   ├── DesktopSidebar.tsx            # 80px sidebar (macOS/Windows)
│   ├── SettingsStack.tsx             # Native stack with exactly one screen
│   └── types.ts                      # RootTabParamList = { SettingsTab }
├── polyfills/localStorage.ts         # In-memory shim — MUST be imported first
├── screens/
│   ├── SettingsScreen.tsx            # Theme, language, country, account, about
│   └── SplashScreen.tsx              # Rendered directly by App.tsx, not registered
└── stores/settingsStore.ts           # The only zustand store
```

`src/services/` and `src/native/` are aliased in babel/tsconfig but **do not exist**.

## Commands

```bash
bun run start          # Metro on port 8090
bun run ios            # Build + run iOS
bun run android        # Build + run Android
bun run macos          # Build + run macOS
bun run windows        # Build + run Windows
bun run typecheck      # TypeScript check
bun run lint           # Run ESLint
bun run test           # jest --passWithNoTests (see Gotchas)
bun run verify         # typecheck + lint + test
```

Every `start`/`ios`/`android`/`macos`/`windows` script has a `pre*` hook that runs
`scripts/merge-env.js` (merges `.env` then `.env.local` into `.env.merged`) and
`scripts/generate-theme-css.js`, then clears the Metro cache.

## Platform-Suffix Resolution — Read This First

Three modules use RN's platform-extension mechanism, and **the unsuffixed `.ts` file is the
desktop/fallback implementation, not the shared one**:

| Base file (desktop) | Platform variants |
|---|---|
| `di/initializeServices.ts` (no-ops, returns `null`) | `.ios.ts`, `.android.ts` |
| `context/AuthContext.tsx` (JS SDK + WebAuth PKCE) | `.ios.tsx`, `.android.tsx` (native) |
| `hooks/useTabBarHeight.ts` (returns `0`) | `.ios.ts`, `.android.ts` |

There are **no `.macos.*` / `.windows.*` files** — desktop gets the base file. Consequences:

- On desktop, `getAnalytics()` returns `null`, so every `src/analytics.ts` call silently no-ops.
- Editing the base `.ts` to "fix mobile" changes **only desktop**.

`react-native.config.js` disables all seven `@react-native-firebase/*` modules and `google-signin`
on macOS.

## Theming

The active design theme must be kept in sync across **four** places: `tailwind.config.js`,
`global.css` (generated by `prestart`, checked in, "do not edit by hand"), `src/config/designTheme.ts`,
and `src/config/themeVars.ts`.

NativeWind cannot switch CSS-variable blocks on native, so `:root`/`.dark`/`@media` don't work.
Variables are applied at runtime via `vars()` on a wrapping `View` (`ThemeVarsProvider`), and
`generate-theme-css.js` deliberately strips the `.dark` block from the generated CSS.

Light/dark is resolved independently in `ThemeVarsProvider` and `AppNavigator`, which also pushes it
into `nativewindColorScheme.set(...)`. Three sources kept in lockstep by hand.

## Environment Variables

All `process.env` reads live in `src/config/env.ts`. Nothing else reads env.

| Variable | Default |
|----------|---------|
| `EXPO_PUBLIC_API_URL` | `http://localhost:8029` |
| `EXPO_PUBLIC_FIREBASE_API_KEY` | `''` |
| `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN` | `''` |
| `EXPO_PUBLIC_FIREBASE_PROJECT_ID` | `''` |
| `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET` | `''` |
| `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | `''` |
| `EXPO_PUBLIC_FIREBASE_APP_ID` | `''` |
| `EXPO_PUBLIC_DEV_MODE` | `'false'` |
| `VITE_APP_NAME` | `'Starter App'` |
| `VITE_APP_DOMAIN` | `'example.com'` |
| `VITE_COMPANY_NAME` | `'My Company'` |
| `GOOGLE_OAUTH_CLIENT_ID` | `''` |
| `GOOGLE_OAUTH_IOS_CLIENT_ID` | `''` |
| `GOOGLE_OAUTH_REVERSED_CLIENT_ID` | `''` |

Firebase vars **default to `''`**, they are not enforced as required.

## Related Projects

- **mogulgame_types** — Installed (`0.0.22`), **not imported**
- **mogulgame_client** — Installed (`0.0.31`), **not imported**. Exposes `useProperties`, `useOffers`, `useLeaderboard`, `useFavorites`, `usePopularProperties`, `useUserProfile`
- **mogulgame_lib** — Installed (`0.0.29`), **not imported**
- **mogulgame_api** — Backend; `EXPO_PUBLIC_API_URL` defaults to its port
- **mogulgame_app** — Web counterpart, which *does* consume client/lib/types

`@sudobility/di` is also a declared dependency with zero import sites (likely transitive via `di_rn`).

Actually used: `auth_lib`, `building_blocks_rn`, `components-rn`, `design`, `di_rn`, `types`.

## Coding Patterns

- `App.tsx:1` — `import '@/polyfills/localStorage';` **must stay first**, before any zustand store import. `persist` defaults to `createJSONStorage(() => localStorage)`; if `localStorage` is undefined it skips installing `api.persist` entirely
- All `process.env` access goes through `src/config/env.ts`
- babel `module-resolver` aliases are **first-match**: list specific aliases (`@/assets/*`) before the general `@` or you get a real bundle break that tsconfig masks
- Platform differences use `.ios`/`.android` suffixes with the base file as the desktop implementation

## Gotchas

- **Metro runs on port 8090**, not the default 8081
- **`bun run test` is `jest --passWithNoTests`.** A green run does not mean tests ran. There are exactly **two** test files (`config/__tests__/constants.test.ts`, `polyfills/__tests__/localStorage.test.ts`). No component, navigation, store, or context tests
- **i18n ships 15 locale directories but registers only English.** `assets/locales.ts` imports `en` alone. Selecting another language persists the choice and loads nothing. `SUPPORTED_LANGUAGES` is also duplicated between `src/i18n/index.ts` and `src/config/constants.ts`
- **`CountryCode` is redeclared locally** in `src/stores/settingsStore.ts` and `src/screens/SettingsScreen.tsx` behind a stale `// TODO: Import from '@sudobility/mogulgame_types' once ^0.0.20 is published`. `0.0.22` is installed — this TODO is actionable now
- The `localStorage` polyfill is a pure **in-memory** shim. It does **not** bridge to AsyncStorage; the store swaps in AsyncStorage separately
- **NativeWind's JSX transform is Metro-only** (`babel.config.js` gates on `api.caller`). JSX behaves differently under Jest than under Metro
- `jest.config.js` maps only `^@/(.*)$` -> `src/$1`. `@/assets/*` is **not** mapped, so any test that transitively imports `src/i18n/index.ts` will fail to resolve
- `app.json` declares `com.sudobility.mogulgame`, but native identifiers were never renamed: `ios/StarterApp.xcodeproj`, `macos/StarterApp-macOS/`, `windows/StarterApp.sln`, `android/.../com/sudobility/starter/`
- `app.json`'s expo `version` is `1.0.0` while `package.json` is `1.0.64` -- they have diverged
- iOS/Android Google client IDs are **hardcoded in `AuthContext.ios.tsx` / `.android.tsx`**, not read from env. The three `GOOGLE_OAUTH_*` env vars lack the `EXPO_PUBLIC_` prefix, so Metro never inlines them and they are always `''`
- `i18n` is initialized twice (`index.ts` and `App.tsx`)
- `STORAGE_KEYS.SETTINGS` is never used; the persist key is the unrelated literal `'starter-settings'`
- `__mocks__/react-native-config.js` mocks a package that is not in `package.json`
- `react-native-in-app-review` is a dependency with no import sites
