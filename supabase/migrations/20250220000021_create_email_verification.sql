-- email_verification table for Creator Ops Hub verification tracking
CREATE TABLE IF NOT EXISTS email_verification (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE email_verification ENABLE ROW LEVEL SECURITY;

-- Users can read their own data
CREATE POLICY "email_verification_read_own" ON email_verification
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own data
CREATE POLICY "email_verification_insert_own" ON email_verification
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own data
CREATE POLICY "email_verification_update_own" ON email_verification
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own data
CREATE POLICY "email_verification_delete_own" ON email_verification
  FOR DELETE USING (auth.uid() = user_id);
