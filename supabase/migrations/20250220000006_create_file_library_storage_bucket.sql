-- Create storage bucket for file library assets
-- If this fails (storage not enabled), create via Supabase Dashboard: Storage > New bucket > file-library (public)

INSERT INTO storage.buckets (id, name, public)
VALUES ('file-library', 'file-library', true)
ON CONFLICT (id) DO NOTHING;
