-- analytics_metrics table for workspace analytics
CREATE TABLE IF NOT EXISTS analytics_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  channel TEXT NOT NULL,
  metric_type TEXT NOT NULL,
  metric_value NUMERIC NOT NULL,
  metadata JSONB,
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_analytics_metrics_user_recorded
  ON analytics_metrics (user_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_metrics_channel
  ON analytics_metrics (user_id, channel, recorded_at DESC);

ALTER TABLE analytics_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "analytics_metrics_read_own" ON analytics_metrics
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "analytics_metrics_insert_own" ON analytics_metrics
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "analytics_metrics_delete_own" ON analytics_metrics
  FOR DELETE USING (auth.uid() = user_id);

-- analytics_content table for content-level metrics
CREATE TABLE IF NOT EXISTS analytics_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content_id UUID,
  title TEXT NOT NULL,
  channel TEXT NOT NULL,
  impressions INTEGER DEFAULT 0,
  engagement INTEGER DEFAULT 0,
  engagement_rate NUMERIC DEFAULT 0,
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_analytics_content_user_recorded
  ON analytics_content (user_id, recorded_at DESC);

ALTER TABLE analytics_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "analytics_content_read_own" ON analytics_content
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "analytics_content_insert_own" ON analytics_content
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "analytics_content_delete_own" ON analytics_content
  FOR DELETE USING (auth.uid() = user_id);
