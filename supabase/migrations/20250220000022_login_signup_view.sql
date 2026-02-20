-- Create a view with a URL-safe name for Supabase client (table "login_/_signup" has slash in path)
-- The view allows inserts via INSTEAD OF trigger for session recording

CREATE OR REPLACE VIEW login_signup AS
SELECT id, user_id, title, description, status, created_at, updated_at
FROM "login_/_signup";

-- Enable insert via the view (redirects to base table)
CREATE OR REPLACE FUNCTION login_signup_insert_fn()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO "login_/_signup" (user_id, title, description, status)
  VALUES (NEW.user_id, NEW.title, NEW.description, COALESCE(NEW.status, 'active'))
  RETURNING id, created_at, updated_at INTO NEW.id, NEW.created_at, NEW.updated_at;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS login_signup_insert_trigger ON login_signup;
CREATE TRIGGER login_signup_insert_trigger
  INSTEAD OF INSERT ON login_signup
  FOR EACH ROW
  EXECUTE FUNCTION login_signup_insert_fn();

-- Grant access to the view for authenticated users and service role
GRANT SELECT, INSERT, UPDATE, DELETE ON login_signup TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON login_signup TO service_role;
