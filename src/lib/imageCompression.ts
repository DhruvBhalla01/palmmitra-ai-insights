/**
 * Client-side image compression.
 *
 * Mobile cameras produce 3–8 MB photos. Uploading those over Indian 4G/3G is slow
 * enough that the browser can background/sleep the tab mid-request, which surfaces
 * as "Failed to send a request to the Edge Function". Shrinking to a long edge of
 * 1600px at quality 0.85 keeps palm lines fully legible while cutting the payload
 * by ~80–95%.
 */

const MAX_EDGE = 1600;
const QUALITY = 0.85;
const SKIP_BELOW_BYTES = 400 * 1024; // already small enough

const COMPRESSIBLE = new Set(['image/jpeg', 'image/png', 'image/webp']);

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('decode failed'));
    img.src = url;
  });
}

export async function compressImage(file: File): Promise<File> {
  try {
    if (!COMPRESSIBLE.has(file.type)) return file;
    if (file.size <= SKIP_BELOW_BYTES) return file;
    if (typeof document === 'undefined' || typeof URL?.createObjectURL !== 'function') return file;

    const objectUrl = URL.createObjectURL(file);
    let img: HTMLImageElement;
    try {
      img = await loadImage(objectUrl);
    } finally {
      URL.revokeObjectURL(objectUrl);
    }

    const { naturalWidth: w, naturalHeight: h } = img;
    if (!w || !h) return file;

    const scale = Math.min(1, MAX_EDGE / Math.max(w, h));
    const targetW = Math.round(w * scale);
    const targetH = Math.round(h * scale);

    const canvas = document.createElement('canvas');
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext('2d');
    if (!ctx) return file;
    ctx.drawImage(img, 0, 0, targetW, targetH);

    const blob: Blob | null = await new Promise((resolve) =>
      canvas.toBlob((b) => resolve(b), 'image/jpeg', QUALITY),
    );
    if (!blob || blob.size === 0 || blob.size >= file.size) return file;

    const baseName = file.name.replace(/\.[^.]+$/, '') || 'palm';
    return new File([blob], `${baseName}.jpg`, { type: 'image/jpeg', lastModified: Date.now() });
  } catch {
    // Compression is an optimisation only — never block the upload.
    return file;
  }
}
