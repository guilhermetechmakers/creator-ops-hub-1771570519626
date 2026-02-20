-- publishing_queue_logs table (publishing_queue_&_logs per spec - using valid identifier)
CREATE TABLE IF NOT EXISTS publishing_queue_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  platform TEXT NOT NULL DEFAULT 'instagram',
  scheduled_time TIMESTAMP WITH TIME ZONE,
  payload JSONB DEFAULT '{}',
  error_logs TEXT,
  status TEXT DEFAULT 'queued' CHECK (status IN ('queued', 'processing', 'published', 'failed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_publishing_queue_logs_user_status ON publishing_queue_logs(user_id, status);
CREATE INDEX idx_publishing_queue_logs_scheduled ON publishing_queue_logs(scheduled_time);
CREATE INDEX idx_publishing_queue_logs_platform ON publishing_queue_logs(platform);

ALTER TABLE publishing_queue_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "publishing_queue_logs_read_own" ON publishing_queue_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "publishing_queue_logs_insert_own" ON publishing_queue_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "publishing_queue_logs_update_own" ON publishing_queue_logs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "publishing_queue_logs_delete_own" ON publishing_queue_logs
  FOR DELETE USING (auth.uid() = user_id);
