-- landing_page table
CREATE TABLE IF NOT EXISTS landing_page (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE landing_page ENABLE ROW LEVEL SECURITY;

CREATE POLICY "landing_page_read_own" ON landing_page
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "landing_page_insert_own" ON landing_page
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "landing_page_update_own" ON landing_page
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "landing_page_delete_own" ON landing_page
  FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_landing_page_user_id ON landing_page(user_id);
CREATE INDEX IF NOT EXISTS idx_landing_page_status ON landing_page(status);
