import { supabase } from '@/lib/supabase/client'

/**
 * Generates a signed URL for a file in a private bucket.
 * @param path The file path in the bucket (e.g., 'folder/file.pdf')
 * @param bucket The bucket name (default: 'documents')
 * @param expiresIn Expiration time in seconds (default: 3600 - 1 hour)
 * @returns The signed URL or null if error
 */
export const getSignedUrl = async (
  path: string,
  bucket: string = 'documents',
  expiresIn: number = 3600,
): Promise<string | null> => {
  try {
    // If it's already a full URL (e.g. Google Drive), return it as is
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path
    }

    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn)

    if (error) {
      console.error('Error creating signed URL:', error)
      return null
    }

    return data.signedUrl
  } catch (error) {
    console.error('Unexpected error in getSignedUrl:', error)
    return null
  }
}

/**
 * Uploads a file to a private bucket.
 * @param file The file object to upload
 * @param path The destination path (e.g., 'emendas/123/file.pdf')
 * @param bucket The bucket name (default: 'documents')
 * @returns The path of the uploaded file or null if error
 */
export const uploadFile = async (
  file: File,
  path: string,
  bucket: string = 'documents',
): Promise<string | null> => {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: true,
      })

    if (error) {
      console.error('Error uploading file:', error)
      return null
    }

    return data.path
  } catch (error) {
    console.error('Unexpected error in uploadFile:', error)
    return null
  }
}
