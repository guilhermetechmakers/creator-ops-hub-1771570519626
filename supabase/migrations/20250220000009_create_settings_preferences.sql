-- settings_preferences table (Settings & Preferences)
CREATE TABLE IF NOT EXISTS settings_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE settings_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "settings_preferences_read_own" ON settings_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "settings_preferences_insert_own" ON settings_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "settings_preferences_update_own" ON settings_preferences
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "settings_preferences_delete_own" ON settings_preferences
  FOR DELETE USING (auth.uid() = user_id);
