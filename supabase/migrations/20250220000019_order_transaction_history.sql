-- Add amount and invoice_url to checkout_payment for Order / Transaction History
ALTER TABLE checkout_payment
  ADD COLUMN IF NOT EXISTS amount_cents INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS invoice_url TEXT;

CREATE INDEX IF NOT EXISTS idx_checkout_payment_created_at ON checkout_payment(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_checkout_payment_status ON checkout_payment(status);
