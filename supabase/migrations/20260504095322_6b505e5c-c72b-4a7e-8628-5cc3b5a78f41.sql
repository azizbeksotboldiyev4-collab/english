UPDATE storage.buckets
SET public = false
WHERE id = 'lesson-videos';

DROP POLICY IF EXISTS "Anyone can watch lesson videos" ON storage.objects;

CREATE POLICY "Authenticated users can watch lesson videos"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'lesson-videos');