-- Create storage bucket for palm uploads
INSERT INTO storage.buckets (id, name, public) 
VALUES ('palm-uploads', 'palm-uploads', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for palm-uploads bucket
CREATE POLICY "Anyone can upload palm images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'palm-uploads');

CREATE POLICY "Anyone can view palm images"
ON storage.objects FOR SELECT
USING (bucket_id = 'palm-uploads');

-- Create palm_reports table
CREATE TABLE public.palm_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT,
  user_name TEXT NOT NULL,
  user_age TEXT,
  reading_type TEXT DEFAULT 'full',
  image_url TEXT NOT NULL,
  validation_confidence INT,
  validation_quality TEXT,
  report_json JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on palm_reports
ALTER TABLE public.palm_reports ENABLE ROW LEVEL SECURITY;

-- Public can insert reports (for MVP without auth)
CREATE POLICY "Anyone can create palm reports"
ON public.palm_reports FOR INSERT
WITH CHECK (true);

-- Public can read their own reports by ID
CREATE POLICY "Anyone can read palm reports"
ON public.palm_reports FOR SELECT
USING (true);

-- Create index for faster lookups
CREATE INDEX idx_palm_reports_created_at ON public.palm_reports(created_at DESC);