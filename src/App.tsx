import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AppShell } from '@/components/layout/app-shell'
import { LandingPage } from '@/pages/landing'
import { LoginPage } from '@/pages/login'
import { SignupPage } from '@/pages/signup'
import { LoginSignupPage } from '@/pages/Login/Signup'
import { DashboardPage } from '@/pages/dashboard'
import { LibraryPage } from '@/pages/library'
import { StudioPage } from '@/pages/studio'
import { ResearchPage } from '@/pages/research'
import { CalendarPage } from '@/pages/calendar'
import { IntegrationsPage } from '@/pages/integrations'
import { AnalyticsPage } from '@/pages/analytics'
import { SettingsPage } from '@/pages/settings'
import { NotFoundPage } from '@/pages/not-found'
import { PrivacyPage } from '@/pages/privacy'
import { TermsPage } from '@/pages/terms'
import { ForgotPasswordPage } from '@/pages/forgot-password'
import { EmailVerificationPage } from '@/pages/email-verification'
import { OAuthGoogleCallbackPage } from '@/pages/oauth-google-callback'
import { PublishingQueueLogsPage } from '@/pages/publishing-queue-logs'
import { ContentEditorPage } from '@/pages/content-editor'

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/login-/-signup" element={<LoginSignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/verify-email" element={<EmailVerificationPage />} />
          <Route path="/oauth/google/callback" element={<OAuthGoogleCallbackPage />} />
          <Route path="/dashboard" element={<AppShell />}>
            <Route index element={<DashboardPage />} />
            <Route path="library" element={<LibraryPage />} />
            <Route path="studio" element={<StudioPage />} />
            <Route path="studio/new" element={<StudioPage />} />
            <Route path="studio/:id" element={<StudioPage />} />
            <Route path="research" element={<ResearchPage />} />
            <Route path="research/new" element={<ResearchPage />} />
            <Route path="calendar" element={<CalendarPage />} />
            <Route path="integrations" element={<IntegrationsPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="publishing-queue-logs" element={<PublishingQueueLogsPage />} />
            <Route path="content-editor" element={<ContentEditorPage />} />
            <Route path="content-editor/new" element={<ContentEditorPage />} />
            <Route path="content-editor/:id" element={<ContentEditorPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/404" element={<NotFoundPage />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" richColors />
    </>
  )
}

export default App
