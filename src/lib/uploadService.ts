/**
 * Upload Service
 * Handles file uploads to Express server (/api/upload)
 * Saves images, PDFs, resumes, and documents as static files on the server disk
 * Returns static file URLs (e.g. /uploads/documents/cv_12345.pdf)
 */

export interface UploadResult {
  success: boolean;
  url: string;
  fileName: string;
  size: string;
  error?: string;
}

/**
 * Uploads a File object or Base64 Data URL to the server (/api/upload)
 */
export async function uploadFileToServer(
  fileOrBase64: File | string,
  customFileName?: string,
  folder = 'documents'
): Promise<UploadResult> {
  try {
    let fileName = customFileName || 'uploaded_file';
    let fileData = '';

    if (typeof fileOrBase64 === 'string') {
      fileData = fileOrBase64;
    } else if (fileOrBase64 instanceof File) {
      fileName = fileOrBase64.name;
      // Convert File to base64 for transmission to /api/upload
      fileData = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('Failed to read file buffer.'));
        reader.readAsDataURL(fileOrBase64);
      });
    }

    const response = await fetch('/api/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fileName,
        fileData,
        folder
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.warn('[UploadService] Server upload returned non-200:', errText);
      return {
        success: false,
        url: folder === 'avatars' 
          ? 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=compress&cs=tinysrgb&w=150' 
          : '/uploads/documents/document.pdf',
        fileName,
        size: '100 KB',
        error: 'Server upload unavailable'
      };
    }

    const data = await response.json();
    if (data.success && data.url) {
      return {
        success: true,
        url: data.url,
        fileName: data.fileName || fileName,
        size: data.size || '100 KB'
      };
    }

    throw new Error(data.error || 'Upload failed');
  } catch (err: any) {
    console.error('[UploadService] Error uploading file to server:', err);
    return {
      success: false,
      url: folder === 'avatars' 
        ? 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=compress&cs=tinysrgb&w=150' 
        : '/uploads/documents/document.pdf',
      fileName: customFileName || 'file.pdf',
      size: '100 KB',
      error: err.message
    };
  }
}
