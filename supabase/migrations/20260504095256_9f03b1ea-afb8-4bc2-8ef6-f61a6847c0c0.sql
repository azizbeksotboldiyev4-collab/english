INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'lesson-videos',
  'lesson-videos',
  true,
  524288000,
  ARRAY['video/mp4', 'video/webm', 'video/quicktime', 'video/x-m4v']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

CREATE POLICY "Anyone can watch lesson videos"
ON storage.objects
FOR SELECT
USING (bucket_id = 'lesson-videos');

CREATE POLICY "Admins can upload lesson videos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'lesson-videos'
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);

CREATE POLICY "Admins can replace lesson videos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'lesson-videos'
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
)
WITH CHECK (
  bucket_id = 'lesson-videos'
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);

CREATE POLICY "Admins can delete lesson videos"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'lesson-videos'
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);