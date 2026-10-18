/**
 * Client-side image compressor utility using HTML5 Canvas.
 * Compresses raw high-resolution images down to compact, crisp Data URLs
 * to ensure permanent local/backend storage without hitting browser storage quotas.
 */

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.1 to 1.0
  mimeType?: 'image/jpeg' | 'image/png' | 'image/webp';
}

export async function compressImage(
  fileOrDataUrl: File | Blob | string,
  options: CompressionOptions = {}
): Promise<string> {
  const {
    maxWidth = 1000,
    maxHeight = 1000,
    quality = 0.8,
    mimeType = 'image/jpeg',
  } = options;

  return new Promise((resolve, reject) => {
    let sourceUrl = '';

    if (typeof fileOrDataUrl === 'string') {
      // If it's already a small data URL or external URL, check
      if (fileOrDataUrl.startsWith('http://') || fileOrDataUrl.startsWith('https://')) {
        resolve(fileOrDataUrl);
        return;
      }
      sourceUrl = fileOrDataUrl;
    } else {
      sourceUrl = URL.createObjectURL(fileOrDataUrl);
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      if (typeof fileOrDataUrl !== 'string') {
        URL.revokeObjectURL(sourceUrl);
      }

      let { width, height } = img;

      // Calculate aspect ratio
      if (width > maxWidth || height > maxHeight) {
        if (width / height > maxWidth / maxHeight) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, width);
      canvas.height = Math.max(1, height);

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(sourceUrl);
        return;
      }

      // Fill with white background in case of transparent png converted to jpeg
      if (mimeType === 'image/jpeg') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      ctx.drawImage(img, 0, 0, width, height);

      try {
        const compressedDataUrl = canvas.toDataURL(mimeType, quality);
        resolve(compressedDataUrl);
      } catch (err) {
        console.warn('Canvas compression error:', err);
        resolve(sourceUrl);
      }
    };

    img.onerror = (err) => {
      console.warn('Image load error during compression:', err);
      // Fallback
      if (typeof fileOrDataUrl === 'string') {
        resolve(fileOrDataUrl);
      } else {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string || '');
        reader.onerror = () => reject(new Error('Failed to read image file'));
        reader.readAsDataURL(fileOrDataUrl);
      }
    };

    img.src = sourceUrl;
  });
}
