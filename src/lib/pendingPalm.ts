// In-memory hand-off of a palm photo picked on the home page to /upload.
// Kept in memory (not sessionStorage) so large phone photos never hit quota.
let pending: File | null = null;

export function setPendingPalm(file: File) {
  pending = file;
}

export function takePendingPalm(): File | null {
  const f = pending;
  pending = null;
  return f;
}
