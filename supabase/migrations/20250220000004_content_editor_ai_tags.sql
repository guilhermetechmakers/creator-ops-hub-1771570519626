-- Add is_ai_generated and tags for Content Studio List (OpenClaw badge, tag search)
ALTER TABLE content_editor
  ADD COLUMN IF NOT EXISTS is_ai_generated BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

CREATE INDEX IF NOT EXISTS idx_content_editor_tags ON content_editor USING GIN (tags);
