-- OpenClaw Agent API: jobs, audit, usage, sources
-- Enables scalable, traceable web research and AI-generated content

-- Research/generation jobs
CREATE TABLE IF NOT EXISTS openclaw_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content_editor_id UUID REFERENCES content_editor(id) ON DELETE SET NULL,
  action TEXT NOT NULL CHECK (action IN ('research', 'fact-check', 'generate')),
  payload JSONB DEFAULT '{}',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  result JSONB,
  error TEXT,
  credits_used INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_openclaw_jobs_user_id ON openclaw_jobs(user_id);
CREATE INDEX idx_openclaw_jobs_status ON openclaw_jobs(status);
CREATE INDEX idx_openclaw_jobs_created_at ON openclaw_jobs(created_at DESC);

ALTER TABLE openclaw_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "openclaw_jobs_read_own" ON openclaw_jobs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "openclaw_jobs_insert_own" ON openclaw_jobs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Sources and citations
CREATE TABLE IF NOT EXISTS openclaw_sources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content_editor_id UUID REFERENCES content_editor(id) ON DELETE CASCADE,
  job_id UUID REFERENCES openclaw_jobs(id) ON DELETE SET NULL,
  url TEXT NOT NULL,
  title TEXT,
  snippet TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_openclaw_sources_user_id ON openclaw_sources(user_id);
CREATE INDEX idx_openclaw_sources_content_editor_id ON openclaw_sources(content_editor_id);

ALTER TABLE openclaw_sources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "openclaw_sources_read_own" ON openclaw_sources
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "openclaw_sources_insert_own" ON openclaw_sources
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "openclaw_sources_delete_own" ON openclaw_sources
  FOR DELETE USING (auth.uid() = user_id);

-- Usage and credits
CREATE TABLE IF NOT EXISTS openclaw_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  research_count INT DEFAULT 0,
  fact_check_count INT DEFAULT 0,
  generate_count INT DEFAULT 0,
  credits_used INT DEFAULT 0,
  credits_limit INT DEFAULT 100,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, period_start)
);

CREATE INDEX idx_openclaw_usage_user_id ON openclaw_usage(user_id);

ALTER TABLE openclaw_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "openclaw_usage_read_own" ON openclaw_usage
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "openclaw_usage_insert_own" ON openclaw_usage
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "openclaw_usage_update_own" ON openclaw_usage
  FOR UPDATE USING (auth.uid() = user_id);

-- Audit trail
CREATE TABLE IF NOT EXISTS openclaw_audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  job_id UUID REFERENCES openclaw_jobs(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_openclaw_audit_user_id ON openclaw_audit_log(user_id);
CREATE INDEX idx_openclaw_audit_created_at ON openclaw_audit_log(created_at DESC);

ALTER TABLE openclaw_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "openclaw_audit_read_own" ON openclaw_audit_log
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "openclaw_audit_insert_own" ON openclaw_audit_log
  FOR INSERT WITH CHECK (auth.uid() = user_id);
