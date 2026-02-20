-- instagram_integrations table for Instagram Graph API OAuth tokens
-- Requires Facebook Login for Business; Instagram Business Account linked to Facebook Page
CREATE TABLE IF NOT EXISTS instagram_integrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  instagram_user_id TEXT,
  instagram_business_account_id TEXT,
  facebook_page_id TEXT,
  instagram_username TEXT,
  scopes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_instagram_integrations_user
  ON instagram_integrations (user_id);

ALTER TABLE instagram_integrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "instagram_integrations_read_own" ON instagram_integrations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "instagram_integrations_insert_own" ON instagram_integrations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "instagram_integrations_update_own" ON instagram_integrations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "instagram_integrations_delete_own" ON instagram_integrations
  FOR DELETE USING (auth.uid() = user_id);
