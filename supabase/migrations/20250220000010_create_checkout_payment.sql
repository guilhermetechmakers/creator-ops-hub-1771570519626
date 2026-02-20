-- checkout_payment table (Order / Transaction History, Checkout / Payment)
CREATE TABLE IF NOT EXISTS checkout_payment (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE checkout_payment ENABLE ROW LEVEL SECURITY;

CREATE POLICY "checkout_payment_read_own" ON checkout_payment
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "checkout_payment_insert_own" ON checkout_payment
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "checkout_payment_update_own" ON checkout_payment
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "checkout_payment_delete_own" ON checkout_payment
  FOR DELETE USING (auth.uid() = user_id);
