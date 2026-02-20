-- Content Editor version history for topbar version history feature
CREATE TABLE IF NOT EXISTS content_editor_version (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_editor_id UUID REFERENCES content_editor(id) ON DELETE CASCADE NOT NULL,
  content_body TEXT,
  version_number INT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX idx_content_editor_version_content_id ON content_editor_version(content_editor_id);
CREATE INDEX idx_content_editor_version_created_at ON content_editor_version(created_at DESC);

ALTER TABLE content_editor_version ENABLE ROW LEVEL SECURITY;

-- Users can read versions of content they own
CREATE POLICY "content_editor_version_read" ON content_editor_version
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM content_editor ce
      WHERE ce.id = content_editor_version.content_editor_id
      AND ce.user_id = auth.uid()
    )
  );

-- Users can insert versions for their content
CREATE POLICY "content_editor_version_insert" ON content_editor_version
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM content_editor ce
      WHERE ce.id = content_editor_version.content_editor_id
      AND ce.user_id = auth.uid()
    )
  );
