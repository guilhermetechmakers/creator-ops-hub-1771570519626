# Creator Ops Hub

An integrated workspace for creators, personal brands, and small content teams to centralize assets, planning, research, and AI-driven execution.

## Features

- **Landing Page** – Hero, feature highlights, CTA
- **Auth** – Login, Signup, Forgot Password, Email Verification
- **Dashboard** – Single-pane operational view with widgets
- **File Library** – Asset management with search and grid/list views
- **Content Studio** – Content list with status and channel filters
- **Research Hub** – OpenClaw research with confidence scores
- **Editorial Calendar** – Month view with channel color-coding
- **Integrations** – Connected services management
- **Analytics** – Impressions and engagement charts (Recharts)
- **Settings** – Account, workspace, security

## Tech Stack

- React 18+ with TypeScript
- Vite with path aliases (`@/`)
- Tailwind CSS v3 with design system (Deep Indigo, Coral)
- React Router 6
- Sonner (toasts), Recharts, React Hook Form + Zod
- Lucide React icons

## Commands

```bash
npm install
npm run build
npm run lint
```

## Routes

| Path | Page |
|------|------|
| `/` | Landing |
| `/login` | Login |
| `/signup` | Signup |
| `/forgot-password` | Password reset |
| `/verify-email` | Email verification |
| `/dashboard` | Dashboard home |
| `/dashboard/library` | File Library |
| `/dashboard/studio` | Content Studio |
| `/dashboard/research` | Research Hub |
| `/dashboard/calendar` | Editorial Calendar |
| `/dashboard/integrations` | Integrations |
| `/dashboard/analytics` | Analytics |
| `/dashboard/settings` | Settings |
| `/privacy` | Redirects to Privacy Policy |
| `/privacy-policy` | Privacy Policy (full legal) |
| `/terms` | Terms of Service |
