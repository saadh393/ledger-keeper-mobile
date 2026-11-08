import { useForm } from '@tanstack/react-form';
import { useRouter } from 'expo-router';
import { Eye, EyeOff } from 'lucide-react-native';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { getFieldError } from '@/components/ui/form-utils';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { authClient, getAuthErrorMessage } from '@/features/auth/api/auth-client';
import {
  createEmailSchema,
  createNameSchema,
  createSignInPasswordSchema,
  createSignUpPasswordSchema,
} from '@/features/auth/schemas/auth-schemas';
import { useAuthStore } from '@/features/auth/use-auth-store';
import { useThemeColors } from '@/lib/theme/use-theme-colors';

export type AuthMode = 'signin' | 'signup';

export type EmailPasswordFormProps = {
  initialMode?: AuthMode;
  onSuccess?: (token: string) => void;
};

function PasswordToggle({
  showPassword,
  onToggle,
  showLabel,
  hideLabel,
  iconColor,
}: {
  showPassword: boolean;
  onToggle: () => void;
  showLabel: string;
  hideLabel: string;
  iconColor: string;
}) {
  return (
    <Pressable
      testID="toggle-password-visibility"
      accessibilityRole="button"
      accessibilityLabel={showPassword ? hideLabel : showLabel}
      hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      className="size-10 items-center justify-center rounded-full"
      onPress={onToggle}
    >
      {showPassword
        ? (
            <EyeOff size={20} strokeWidth={1.75} color={iconColor} />
          )
        : (
            <Eye size={20} strokeWidth={1.75} color={iconColor} />
          )}
    </Pressable>
  );
}

function FormErrorMessage({ message }: { message: string }) {
  return (
    <View
      testID="auth-form-error"
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      className="mb-4 rounded-[12px] bg-clay-100 p-3"
    >
      <Text className="text-meta text-clay-500">{message}</Text>
    </View>
  );
}

function AuthModeToggle({
  prompt,
  actionText,
  onToggle,
}: {
  prompt: string;
  actionText: string;
  onToggle: () => void;
}) {
  return (
    <View className="mt-6 flex-row items-center justify-center">
      <Text className="text-body text-ink-500">
        {prompt}
        {' '}
      </Text>
      <Pressable
        testID="toggle-auth-mode"
        accessibilityRole="button"
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        onPress={onToggle}
      >
        <Text className="text-row-title font-medium text-link">{actionText}</Text>
      </Pressable>
    </View>
  );
}

function useAuthValidators(t: (key: string) => string) {
  const nameValidator = React.useMemo(
    () => createNameSchema({ nameRequired: t('auth.errors.nameRequired') }),
    [t],
  );
  const emailValidator = React.useMemo(
    () =>
      createEmailSchema({
        emailRequired: t('auth.errors.emailRequired'),
        emailInvalid: t('auth.errors.emailInvalid'),
      }),
    [t],
  );
  const signInPasswordValidator = React.useMemo(
    () =>
      createSignInPasswordSchema({
        passwordRequired: t('auth.errors.passwordRequired'),
      }),
    [t],
  );
  const signUpPasswordValidator = React.useMemo(
    () =>
      createSignUpPasswordSchema({
        passwordRequired: t('auth.errors.passwordRequired'),
        passwordMinLength: t('auth.errors.passwordMinLength'),
      }),
    [t],
  );

  return {
    nameValidator,
    emailValidator,
    signInPasswordValidator,
    signUpPasswordValidator,
  };
}

function useEmailPasswordForm({
  mode,
  isSignUp,
  t,
  router,
  onSuccess,
}: {
  mode: AuthMode;
  isSignUp: boolean;
  t: (key: string) => string;
  router: ReturnType<typeof useRouter>;
  onSuccess?: (token: string) => void;
}) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);
  const submittingRef = React.useRef(false);

  const form = useForm({
    defaultValues: { name: '', email: '', password: '' },
    onSubmit: async ({ value }) => {
      if (submittingRef.current) {
        return;
      }
      submittingRef.current = true;
      setIsSubmitting(true);
      setFormError(null);
      try {
        const token = isSignUp
          ? await authClient.signUpWithEmail(value.name, value.email, value.password)
          : await authClient.signInWithEmail(value.email, value.password);
        await useAuthStore.getState().signIn(token);
        if (onSuccess) {
          onSuccess(token);
        }
        else {
          router.replace('/');
        }
      }
      catch (err: unknown) {
        const { message, shouldClearPassword } = getAuthErrorMessage(err, mode, t);
        setFormError(message);
        if (shouldClearPassword) {
          form.setFieldValue('password', '');
        }
      }
      finally {
        setIsSubmitting(false);
        submittingRef.current = false;
      }
    },
  });

  return { form, isSubmitting, formError, setFormError };
}

type FormInstance = ReturnType<typeof useEmailPasswordForm>['form'];

function NameFormField({
  form,
  validator,
  label,
  placeholder,
  disabled,
}: {
  form: FormInstance;
  validator: ReturnType<typeof createNameSchema>;
  label: string;
  placeholder: string;
  disabled: boolean;
}) {
  return (
    <form.Field name="name" validators={{ onChange: validator, onSubmit: validator }}>
      {field => (
        <Input
          testID="name-input"
          label={label}
          placeholder={placeholder}
          value={field.state.value}
          onChangeText={field.handleChange}
          onBlur={field.handleBlur}
          error={getFieldError(field)}
          disabled={disabled}
          autoComplete="name"
        />
      )}
    </form.Field>
  );
}

function EmailFormField({
  form,
  validator,
  label,
  placeholder,
  disabled,
}: {
  form: FormInstance;
  validator: ReturnType<typeof createEmailSchema>;
  label: string;
  placeholder: string;
  disabled: boolean;
}) {
  return (
    <form.Field name="email" validators={{ onChange: validator, onSubmit: validator }}>
      {field => (
        <Input
          testID="email-input"
          label={label}
          placeholder={placeholder}
          value={field.state.value}
          onChangeText={field.handleChange}
          onBlur={field.handleBlur}
          error={getFieldError(field)}
          disabled={disabled}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          textContentType="emailAddress"
        />
      )}
    </form.Field>
  );
}

function PasswordFormField({
  form,
  validator,
  label,
  placeholder,
  disabled,
  isSignUp,
  showPassword,
  onTogglePassword,
  showLabel,
  hideLabel,
  iconColor,
}: {
  form: FormInstance;
  validator: ReturnType<typeof createSignUpPasswordSchema> | ReturnType<typeof createSignInPasswordSchema>;
  label: string;
  placeholder: string;
  disabled: boolean;
  isSignUp: boolean;
  showPassword: boolean;
  onTogglePassword: () => void;
  showLabel: string;
  hideLabel: string;
  iconColor: string;
}) {
  return (
    <form.Field
      name="password"
      validators={{
        onChange: validator,
        onSubmit: validator,
      }}
    >
      {field => (
        <Input
          testID="password-input"
          label={label}
          placeholder={placeholder}
          value={field.state.value}
          onChangeText={field.handleChange}
          onBlur={field.handleBlur}
          error={getFieldError(field)}
          disabled={disabled}
          secureTextEntry={!showPassword}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete={isSignUp ? 'new-password' : 'current-password'}
          textContentType={isSignUp ? 'newPassword' : 'password'}
          rightAccessory={(
            <PasswordToggle
              showPassword={showPassword}
              onToggle={onTogglePassword}
              showLabel={showLabel}
              hideLabel={hideLabel}
              iconColor={iconColor}
            />
          )}
        />
      )}
    </form.Field>
  );
}

export function EmailPasswordForm({
  initialMode = 'signin',
  onSuccess,
}: EmailPasswordFormProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const themeColors = useThemeColors();
  const [mode, setMode] = React.useState<AuthMode>(initialMode);
  const [showPassword, setShowPassword] = React.useState(false);

  const isSignUp = mode === 'signup';
  const {
    nameValidator,
    emailValidator,
    signInPasswordValidator,
    signUpPasswordValidator,
  } = useAuthValidators(t);

  const { form, isSubmitting, formError, setFormError } = useEmailPasswordForm({
    mode,
    isSignUp,
    t,
    router,
    onSuccess,
  });

  const handleToggleMode = React.useCallback(() => {
    const nextMode = mode === 'signin' ? 'signup' : 'signin';
    const currentEmail = form.getFieldValue('email') ?? '';
    form.reset();
    if (currentEmail) {
      form.setFieldValue('email', currentEmail, { dontValidate: true });
    }
    setFormError(null);
    setMode(nextMode);
  }, [mode, form, setFormError]);

  const submitLabel = isSubmitting
    ? (isSignUp ? t('auth.creatingAccount') : t('auth.signingIn'))
    : (isSignUp ? t('auth.createAccount') : t('auth.signIn'));

  return (
    <View className="w-full">
      {isSignUp && (
        <NameFormField
          form={form}
          validator={nameValidator}
          label={t('auth.name')}
          placeholder={t('auth.namePlaceholder')}
          disabled={isSubmitting}
        />
      )}

      <EmailFormField
        form={form}
        validator={emailValidator}
        label={t('auth.email')}
        placeholder={t('auth.emailPlaceholder')}
        disabled={isSubmitting}
      />

      <PasswordFormField
        form={form}
        validator={isSignUp ? signUpPasswordValidator : signInPasswordValidator}
        label={t('auth.password')}
        placeholder={isSignUp ? t('auth.newPasswordPlaceholder') : t('auth.passwordPlaceholder')}
        disabled={isSubmitting}
        isSignUp={isSignUp}
        showPassword={showPassword}
        onTogglePassword={() => setShowPassword(prev => !prev)}
        showLabel={t('auth.showPassword')}
        hideLabel={t('auth.hidePassword')}
        iconColor={themeColors['ink-500']}
      />

      {formError && <FormErrorMessage message={formError} />}

      <Button
        testID="auth-submit-button"
        variant="primary"
        label={submitLabel}
        pending={isSubmitting}
        disabled={isSubmitting}
        onPress={() => form.handleSubmit()}
      />

      <AuthModeToggle
        prompt={isSignUp ? t('auth.alreadyHaveAccount') : t('auth.dontHaveAccount')}
        actionText={isSignUp ? t('auth.switchToSignIn') : t('auth.switchToSignUp')}
        onToggle={handleToggleMode}
      />
    </View>
  );
}
