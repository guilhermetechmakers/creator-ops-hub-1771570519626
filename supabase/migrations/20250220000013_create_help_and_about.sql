-- help_and_about table (Documentation hub, FAQs, contact support, changelog)
-- Stores user support tickets and contact form submissions
CREATE TABLE IF NOT EXISTS help_and_about (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE help_and_about ENABLE ROW LEVEL SECURITY;

CREATE POLICY "help_and_about_read_own" ON help_and_about
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "help_and_about_insert_own" ON help_and_about
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "help_and_about_update_own" ON help_and_about
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "help_and_about_delete_own" ON help_and_about
  FOR DELETE USING (auth.uid() = user_id);
