-- file_library table - Central asset manager
CREATE TABLE IF NOT EXISTS file_library (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived')),
  file_name TEXT,
  file_type TEXT,
  file_size BIGINT,
  storage_path TEXT,
  tags JSONB DEFAULT '[]',
  last_used_at TIMESTAMP WITH TIME ZONE,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_file_library_user_id ON file_library(user_id);
CREATE INDEX idx_file_library_status ON file_library(status);
CREATE INDEX idx_file_library_updated_at ON file_library(updated_at DESC);
CREATE INDEX idx_file_library_file_type ON file_library(file_type);
CREATE INDEX idx_file_library_tags ON file_library USING GIN(tags);

ALTER TABLE file_library ENABLE ROW LEVEL SECURITY;

CREATE POLICY "file_library_read_own" ON file_library
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "file_library_insert_own" ON file_library
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "file_library_update_own" ON file_library
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "file_library_delete_own" ON file_library
  FOR DELETE USING (auth.uid() = user_id);
