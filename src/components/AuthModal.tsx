/**
 * AuthModal - Shared authentication modal component
 *
 * Provides a reusable modal with Google Sign-In, email/password form,
 * mode toggle (sign-in vs sign-up), and error display.
 *
 * Styling comes entirely from the design system: layout via NativeWind
 * `className`, colors via semantic tokens and `@sudobility/components-rn`
 * components (Text/Button/Input) — no StyleSheet colors or hardcoded literals.
 *
 * @example
 * ```tsx
 * <AuthModal visible={showAuthModal} onDismiss={() => setShowAuthModal(false)} />
 * ```
 */

import React, { useState, useCallback } from 'react';
import { View, Pressable, Modal, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Button, Input } from '@sudobility/components-rn';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';
import GoogleIcon from '@/components/GoogleIcon';
import { trackButtonClick, trackError, trackEvent } from '@/analytics';

/** Props for the AuthModal component. */
export interface AuthModalProps {
  /** Whether the modal is visible. */
  visible: boolean;
  /** Callback invoked when the modal should be dismissed (cancel or successful auth). */
  onDismiss: () => void;
  /** The initial auth mode to display. Defaults to 'signin'. */
  initialMode?: 'signin' | 'signup';
}

/**
 * A full-screen modal that handles user authentication via Google Sign-In
 * or email/password. Manages its own internal state for form fields,
 * loading indicators, and error messages.
 *
 * @param props - {@link AuthModalProps}
 */
export default function AuthModal({
  visible,
  onDismiss,
  initialMode = 'signin',
}: AuthModalProps) {
  const { t } = useTranslation();
  const { signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();

  const [authMode, setAuthMode] = useState<'signin' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /** Reset form state when the modal closes. */
  const handleDismiss = useCallback(() => {
    setEmail('');
    setPassword('');
    setAuthError(null);
    setIsSubmitting(false);
    onDismiss();
  }, [onDismiss]);

  /** Submit email/password authentication (sign-in or sign-up). */
  const handleAuthSubmit = useCallback(async () => {
    if (!email.trim() || !password.trim()) {
      setAuthError(t('auth.fillAllFields'));
      return;
    }
    setIsSubmitting(true);
    setAuthError(null);
    trackButtonClick(authMode === 'signin' ? 'email_sign_in' : 'email_sign_up');
    try {
      if (authMode === 'signin') {
        await signInWithEmail(email, password);
      } else {
        await signUpWithEmail(email, password);
      }
      trackEvent(authMode === 'signin' ? 'signed_in' : 'signed_up');
      handleDismiss();
    } catch (error: unknown) {
      const authErr = error as { message?: string };
      const message = authErr.message || t('auth.error');
      trackError(message, `${authMode}_error`);
      setAuthError(message);
    } finally {
      setIsSubmitting(false);
    }
  }, [
    email,
    password,
    authMode,
    signInWithEmail,
    signUpWithEmail,
    t,
    handleDismiss,
  ]);

  /** Initiate Google Sign-In via the PKCE OAuth flow. */
  const handleGoogleSignIn = useCallback(async () => {
    setIsSubmitting(true);
    setAuthError(null);
    trackButtonClick('google_sign_in');
    try {
      await signInWithGoogle();
      trackEvent('signed_in_google');
      handleDismiss();
    } catch (error: unknown) {
      const authErr = error as { message?: string; code?: string };
      if (
        authErr.code !== 'SIGN_IN_CANCELLED' &&
        authErr.code !== 'sign_in_cancelled'
      ) {
        const message = authErr.message || t('auth.error');
        trackError(message, 'google_sign_in_error');
        setAuthError(message);
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [signInWithGoogle, t, handleDismiss]);

  const modalContent = (
    <SafeAreaView className='flex-1 bg-background'>
      <View className='flex-row justify-between items-center px-4 py-3 border-b border-border bg-card'>
        <Pressable
          onPress={handleDismiss}
          accessibilityRole='button'
          accessibilityLabel={t('common.cancel')}
        >
          <Text size='base' color='primary'>
            {t('common.cancel')}
          </Text>
        </Pressable>
        <Text size='lg' weight='semibold'>
          {authMode === 'signin' ? t('auth.signIn') : t('auth.signUp')}
        </Text>
        <View className='w-16' />
      </View>

      <View className='p-6'>
        <Pressable
          className={`flex-row items-center justify-center gap-3 rounded-md border border-border bg-card py-3.5 ${
            isSubmitting ? 'opacity-60' : ''
          }`}
          onPress={handleGoogleSignIn}
          disabled={isSubmitting}
          accessibilityRole='button'
          accessibilityLabel={t('auth.continueWithGoogle')}
        >
          <GoogleIcon size={20} />
          <Text size='base' weight='medium'>
            {t('auth.continueWithGoogle')}
          </Text>
        </Pressable>

        <View className='flex-row items-center my-4'>
          <View className='flex-1 h-px bg-border' />
          <Text size='sm' color='muted' className='px-3'>
            {t('common.or')}
          </Text>
          <View className='flex-1 h-px bg-border' />
        </View>

        <Input
          className='mb-3'
          placeholder={t('auth.email')}
          value={email}
          onChangeText={setEmail}
          autoCapitalize='none'
          keyboardType='email-address'
          autoComplete='email'
          accessibilityLabel={t('auth.email')}
        />

        <Input
          className='mb-3'
          placeholder={t('auth.password')}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete='password'
          accessibilityLabel={t('auth.password')}
        />

        {authError && (
          <Text size='sm' color='danger' align='center' className='mb-3'>
            {authError}
          </Text>
        )}

        <Button
          variant='primary'
          loading={isSubmitting}
          disabled={isSubmitting}
          onPress={handleAuthSubmit}
          className='mt-2'
          accessibilityLabel={
            authMode === 'signin' ? t('auth.signIn') : t('auth.signUp')
          }
        >
          {authMode === 'signin' ? t('auth.signIn') : t('auth.signUp')}
        </Button>

        <Pressable
          onPress={() =>
            setAuthMode(authMode === 'signin' ? 'signup' : 'signin')
          }
          className='mt-6 items-center'
          accessibilityRole='button'
          accessibilityLabel={
            authMode === 'signin' ? t('auth.noAccount') : t('auth.hasAccount')
          }
        >
          <Text size='sm' color='primary'>
            {authMode === 'signin' ? t('auth.noAccount') : t('auth.hasAccount')}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );

  // Modal is not supported on macOS/Windows — use a full-screen overlay instead.
  if (Platform.OS === 'macos' || Platform.OS === 'windows') {
    if (!visible) return null;
    return (
      <View className='absolute top-0 bottom-0 left-0 right-0 z-50'>
        {modalContent}
      </View>
    );
  }

  return (
    <Modal
      visible={visible}
      animationType='slide'
      presentationStyle='pageSheet'
      onRequestClose={handleDismiss}
    >
      {modalContent}
    </Modal>
  );
}
