import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import { LoadingProvider } from '@/contexts/loading-context'
import { LoadingOverlay } from '@/components/ui/loading-overlay'
import { AppShell } from '@/components/layout/app-shell'
import { LandingPage } from '@/pages/landing'
import { LoginSignupPage } from '@/pages/Login/Signup'
import { DashboardPage } from '@/pages/dashboard'
import { FileLibraryPage } from '@/pages/FileLibrary'
import { StudioPage } from '@/pages/studio'
import { ResearchPage } from '@/pages/research'
import { CalendarPage } from '@/pages/calendar'
import { IntegrationsPage } from '@/pages/integrations'
import { AnalyticsPage } from '@/pages/analytics'
import { SettingsPreferencesPage } from '@/pages/SettingsPreferences'
import { NotFoundPage } from '@/pages/404NotFound'
import { ServerErrorPage } from '@/pages/500ServerError'
import { PrivacyPolicyPage } from '@/pages/PrivacyPolicy'
import { CookiePolicyPage } from '@/pages/CookiePolicy'
import { TermsPage } from '@/pages/terms'
import { ForgotPasswordPage } from '@/pages/forgot-password'
import { ResetPasswordPage } from '@/pages/reset-password'
import { EmailVerificationPage } from '@/pages/email-verification'
import { OAuthGoogleCallbackPage } from '@/pages/oauth-google-callback'
import { OAuthInstagramCallbackPage } from '@/pages/oauth-instagram-callback'
import { PublishingQueueLogsPage } from '@/pages/publishing-queue-logs'
import { ContentEditorPage } from '@/pages/content-editor'
import { ContentStudioListPage } from '@/pages/content-studio-list'
import { PaymentPage } from '@/pages/Checkout/Payment'
import { OrderTransactionHistoryPage } from '@/pages/OrderTransactionHistory'
import { HelpAndAboutPage } from '@/pages/HelpAndAbout'
import { HelpAndAboutStandalonePage } from '@/pages/HelpAndAboutStandalone'

function App() {
  return (
    <>
      <LoadingProvider>
        <BrowserRouter>
          <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/landing-page" element={<LandingPage />} />
          <Route path="/pricing" element={<Navigate to="/dashboard/checkout-/-payment" replace />} />
          <Route path="/file-library" element={<Navigate to="/dashboard/file-library" replace />} />
          <Route path="/content-studio-(list)" element={<Navigate to="/dashboard/content-studio" replace />} />
          <Route path="/login" element={<Navigate to="/login-/-signup?mode=login" replace />} />
          <Route path="/signup" element={<Navigate to="/login-/-signup?mode=signup" replace />} />
          <Route path="/login-/-signup" element={<LoginSignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/verify-email" element={<EmailVerificationPage />} />
          <Route path="/email-verification" element={<Navigate to="/verify-email" replace />} />
          <Route path="/oauth/google/callback" element={<OAuthGoogleCallbackPage />} />
          <Route path="/oauth/instagram/callback" element={<OAuthInstagramCallbackPage />} />
          <Route path="/dashboard" element={<AppShell />}>
            <Route index element={<DashboardPage />} />
            <Route path="library" element={<FileLibraryPage />} />
            <Route path="file-library" element={<FileLibraryPage />} />
            <Route path="studio" element={<StudioPage />} />
            <Route path="studio/new" element={<StudioPage />} />
            <Route path="studio/:id" element={<StudioPage />} />
            <Route path="research" element={<ResearchPage />} />
            <Route path="research/new" element={<ResearchPage />} />
            <Route path="calendar" element={<CalendarPage />} />
            <Route path="integrations" element={<IntegrationsPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="publishing-queue-logs" element={<PublishingQueueLogsPage />} />
            <Route path="content-studio" element={<ContentStudioListPage />} />
            <Route path="content-editor" element={<ContentEditorPage />} />
            <Route path="content-editor/new" element={<ContentEditorPage />} />
            <Route path="content-editor/:id" element={<ContentEditorPage />} />
            <Route path="settings" element={<SettingsPreferencesPage />} />
            <Route path="settings-&-preferences" element={<SettingsPreferencesPage />} />
            <Route path="help-and-about" element={<HelpAndAboutPage />} />
            <Route path="help-&-about" element={<HelpAndAboutPage />} />
            <Route path="checkout-/-payment" element={<PaymentPage />} />
            <Route path="order-transaction-history" element={<OrderTransactionHistoryPage />} />
          </Route>
          <Route path="/help-and-about" element={<HelpAndAboutStandalonePage />} />
          <Route path="/help-&-about" element={<HelpAndAboutStandalonePage />} />
          <Route path="/privacy" element={<Navigate to="/privacy-policy" replace />} />
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
          <Route path="/cookie-policy" element={<CookiePolicyPage />} />
          <Route path="/terms-of-service" element={<Navigate to="/terms" replace />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/404" element={<NotFoundPage />} />
          <Route path="/404-not-found" element={<NotFoundPage />} />
          <Route path="/500" element={<ServerErrorPage />} />
          <Route path="/500-server-error" element={<ServerErrorPage />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </BrowserRouter>
      <LoadingOverlay />
      <Toaster position="top-right" richColors />
      </LoadingProvider>
    </>
  )
}

export default App
