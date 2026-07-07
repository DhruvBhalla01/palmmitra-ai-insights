
-- Was: unrestricted SELECT on palm-uploads → attacker could list every uploaded palm.
-- Files are still reachable via their (unguessable UUID) public URL — that path
-- bypasses RLS on public buckets. We only remove the object-listing capability.
DROP POLICY IF EXISTS "Anyone can view palm images" ON storage.objects;

-- Was: INSERT policy with no bucket restriction → anon could upload to any bucket.
DROP POLICY IF EXISTS "Anyone can upload palm images" ON storage.objects;
CREATE POLICY "Anyone can upload to palm-uploads"
  ON storage.objects
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (bucket_id = 'palm-uploads');
