-- Perfil docente: escuela + avatares en Storage
ALTER TABLE public.docentes ADD COLUMN IF NOT EXISTS escuela TEXT;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'teacher-avatars',
  'teacher-avatars',
  true,
  2097152,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "teacher_avatars_public_read" ON storage.objects;
CREATE POLICY "teacher_avatars_public_read"
ON storage.objects FOR SELECT
USING (bucket_id = 'teacher-avatars');

DROP POLICY IF EXISTS "teacher_avatars_upload_own" ON storage.objects;
CREATE POLICY "teacher_avatars_upload_own"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'teacher-avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "teacher_avatars_update_own" ON storage.objects;
CREATE POLICY "teacher_avatars_update_own"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'teacher-avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "teacher_avatars_delete_own" ON storage.objects;
CREATE POLICY "teacher_avatars_delete_own"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'teacher-avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
