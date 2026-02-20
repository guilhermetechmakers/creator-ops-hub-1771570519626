-- content_editor table
CREATE TABLE IF NOT EXISTS content_editor (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('draft', 'review', 'scheduled', 'active', 'published')),
  content_body TEXT,
  channel TEXT DEFAULT 'instagram',
  assignee_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  due_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_content_editor_user_id ON content_editor(user_id);
CREATE INDEX idx_content_editor_status ON content_editor(status);
CREATE INDEX idx_content_editor_updated_at ON content_editor(updated_at DESC);

ALTER TABLE content_editor ENABLE ROW LEVEL SECURITY;

CREATE POLICY "content_editor_read_own" ON content_editor
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "content_editor_insert_own" ON content_editor
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "content_editor_update_own" ON content_editor
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "content_editor_delete_own" ON content_editor
  FOR DELETE USING (auth.uid() = user_id);
