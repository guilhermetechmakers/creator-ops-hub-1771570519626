-- dashboard table
CREATE TABLE IF NOT EXISTS dashboard (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE dashboard ENABLE ROW LEVEL SECURITY;

CREATE POLICY "dashboard_read_own" ON dashboard
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "dashboard_insert_own" ON dashboard
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "dashboard_update_own" ON dashboard
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "dashboard_delete_own" ON dashboard
  FOR DELETE USING (auth.uid() = user_id);

-- google_integrations table for OAuth tokens
CREATE TABLE IF NOT EXISTS google_integrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  provider TEXT NOT NULL DEFAULT 'google',
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  scopes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, provider)
);

ALTER TABLE google_integrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "google_integrations_read_own" ON google_integrations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "google_integrations_insert_own" ON google_integrations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "google_integrations_update_own" ON google_integrations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "google_integrations_delete_own" ON google_integrations
  FOR DELETE USING (auth.uid() = user_id);
