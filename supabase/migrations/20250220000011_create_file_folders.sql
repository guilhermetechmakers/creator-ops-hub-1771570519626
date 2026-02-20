-- file_folders table for organizing assets
CREATE TABLE IF NOT EXISTS file_folders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_file_folders_user_id ON file_folders(user_id);

ALTER TABLE file_folders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "file_folders_read_own" ON file_folders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "file_folders_insert_own" ON file_folders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "file_folders_update_own" ON file_folders
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "file_folders_delete_own" ON file_folders
  FOR DELETE USING (auth.uid() = user_id);

-- Add folder_id to file_library
ALTER TABLE file_library
  ADD COLUMN IF NOT EXISTS folder_id UUID REFERENCES file_folders(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_file_library_folder_id ON file_library(folder_id);
