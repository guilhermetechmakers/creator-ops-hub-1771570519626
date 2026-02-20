/**
 * Login/Signup components - spec-compliant re-exports.
 * Maps to: Toggle:Login/Signupswitch, Email/passwordform, Social/OAuthbuttons,
 * ContinuewithGoogle, Link:Forgotpassword,TermsandPrivacyacknowledgement, SSO/EnterpriseAccessCTA
 */
export { ToggleLoginSignupSwitch } from '@/components/login-signup/toggle-login-signup-switch'
export {
  EmailPasswordForm,
  type LoginFormData,
  type SignupFormData,
} from '@/components/login-signup/email-password-form'
export { SocialOAuthButtons, type SocialOAuthButton } from '@/components/login-signup/social-oauth-buttons'
export { ContinueWithGoogle } from '@/components/login-signup/continue-with-google'
export { ForgotPasswordTermsLinks } from '@/components/login-signup/forgot-password-terms-links'
export { SSOEnterpriseCTA } from '@/components/login-signup/sso-enterprise-cta'
export { PasswordStrengthIndicator, type PasswordStrength } from '@/components/login-signup/password-strength-indicator'
export { getPasswordStrength } from '@/lib/password-utils'
