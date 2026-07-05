/**
 * Zanzibar Trip & Relax - Advanced Client-Side Image Optimization Utility
 * Automatically compresses, resizes, and converts images to WebP with JPEG fallbacks.
 * Preserves the original file, creates responsive layouts (Desktop, Tablet, Mobile) and thumbnails.
 */

export interface OptimizedImagePackage {
  id: string;
  name: string;
  originalName: string;
  format: string;
  originalSize: string;
  optimizedSize: string;
  uploadedAt: string;
  // Responsive Image Sizes (Base64 data URLs)
  original: string; // original backup
  desktop: string;  // 1200px wide optimized
  tablet: string;   // 600px wide optimized
  mobile: string;   // 320px wide optimized
  thumbnail: string; // 150x150 square optimized
}

/**
 * Compresses and converts an image file to WebP/JPEG formats at multiple sizes.
 */
export function optimizeUploadedImage(file: File, quality = 0.85): Promise<OptimizedImagePackage> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to load image element.'));
      img.onload = () => {
        try {
          const originalDataUrl = e.target?.result as string;
          
          // Generate configurations
          const desktopData = resizeImage(img, 1200, null, quality);
          const tabletData = resizeImage(img, 600, null, quality);
          const mobileData = resizeImage(img, 320, null, quality);
          const thumbnailData = resizeImage(img, 150, 150, quality); // square thumbnail

          // Calculate estimated size from base64 string
          const optimizedSizeKB = Math.round((desktopData.length * 3) / 4 / 1024);

          resolve({
            id: 'opt-' + Math.floor(Math.random() * 1000000),
            name: file.name.substring(0, file.name.lastIndexOf('.')) + '.webp',
            originalName: file.name,
            format: 'image/webp',
            originalSize: (file.size / 1024).toFixed(0) + ' KB',
            optimizedSize: optimizedSizeKB + ' KB',
            uploadedAt: new Date().toISOString(),
            original: originalDataUrl,
            desktop: desktopData,
            tablet: tabletData,
            mobile: mobileData,
            thumbnail: thumbnailData,
          });
        } catch (err) {
          reject(err);
        }
      };
      img.src = e.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Resize image onto canvas and compress
 */
function resizeImage(img: HTMLImageElement, maxWidth: number, maxHeight: number | null, quality: number): string {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  let width = img.width;
  let height = img.height;

  if (maxHeight && maxWidth) {
    // Force exact size for thumbnails
    width = maxWidth;
    height = maxHeight;
  } else {
    // Maintain aspect ratio
    if (width > maxWidth) {
      height = Math.round((height * maxWidth) / width);
      width = maxWidth;
    }
  }

  canvas.width = width;
  canvas.height = height;

  if (!ctx) {
    throw new Error('Canvas 2D context not available.');
  }

  // Draw and smooth
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, width, height);

  // Convert to WebP, fallback to JPEG if not supported
  try {
    return canvas.toDataURL('image/webp', quality);
  } catch {
    return canvas.toDataURL('image/jpeg', quality);
  }
}

/**
 * Lazy Image Component Helper function.
 * Since modern browsers support loading="lazy" natively on <img> tags,
 * we can write standard markup that lets the browser handle standard viewport lazy-loading.
 */
export function getResponsiveSrcSet(pkg: OptimizedImagePackage) {
  return `${pkg.mobile} 320w, ${pkg.tablet} 600w, ${pkg.desktop} 1200w`;
}
