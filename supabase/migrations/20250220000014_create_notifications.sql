-- notification_templates table (system templates for notification types)
CREATE TABLE IF NOT EXISTS notification_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL UNIQUE,
  channel TEXT NOT NULL DEFAULT 'in_app',
  title_template TEXT NOT NULL,
  body_template TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE notification_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notification_templates_read_all" ON notification_templates
  FOR SELECT USING (true);

-- notification_channels table (per-user channel preferences)
CREATE TABLE IF NOT EXISTS notification_channels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  channel TEXT NOT NULL,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, channel)
);

ALTER TABLE notification_channels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notification_channels_read_own" ON notification_channels
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "notification_channels_insert_own" ON notification_channels
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "notification_channels_update_own" ON notification_channels
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "notification_channels_delete_own" ON notification_channels
  FOR DELETE USING (auth.uid() = user_id);

-- notifications table (in-app notifications)
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL,
  channel TEXT NOT NULL DEFAULT 'in_app',
  title TEXT NOT NULL,
  body TEXT,
  metadata JSONB DEFAULT '{}',
  read_at TIMESTAMP WITH TIME ZONE,
  delivery_retries INT DEFAULT 0,
  status TEXT DEFAULT 'delivered',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_read_at ON notifications(read_at) WHERE read_at IS NULL;

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notifications_read_own" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "notifications_insert_own" ON notifications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "notifications_update_own" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "notifications_delete_own" ON notifications
  FOR DELETE USING (auth.uid() = user_id);

-- Extend user_preferences for notification preferences
ALTER TABLE user_preferences ADD COLUMN IF NOT EXISTS email_new_content BOOLEAN DEFAULT true;
ALTER TABLE user_preferences ADD COLUMN IF NOT EXISTS email_review_actions BOOLEAN DEFAULT true;
ALTER TABLE user_preferences ADD COLUMN IF NOT EXISTS email_failed_publish BOOLEAN DEFAULT true;
ALTER TABLE user_preferences ADD COLUMN IF NOT EXISTS email_system_alerts BOOLEAN DEFAULT true;
ALTER TABLE user_preferences ADD COLUMN IF NOT EXISTS push_enabled BOOLEAN DEFAULT false;

-- Seed default notification templates
INSERT INTO notification_templates (type, channel, title_template, body_template) VALUES
  ('new_content', 'in_app', 'New content created', '{{title}} was added to your workspace'),
  ('review_action', 'in_app', 'Review action required', '{{title}} needs your review'),
  ('publish_status', 'in_app', 'Publish status update', '{{title}} - {{status}}'),
  ('failed_publish', 'in_app', 'Publish failed', '{{title}} failed to publish: {{reason}}'),
  ('system_alert', 'in_app', 'System alert', '{{message}}'),
  ('comment', 'in_app', 'New comment', '{{author}} commented on {{target}}'),
  ('mention', 'in_app', 'You were mentioned', '{{author}} mentioned you in {{target}}')
ON CONFLICT (type) DO NOTHING;
