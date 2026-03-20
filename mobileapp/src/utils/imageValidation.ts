const VALID_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.bmp', '.webp'];

export function isValidImageUri(uri: string): boolean {
  if (uri.startsWith('content://')) return true;
  const lower = uri.toLowerCase();
  return VALID_EXTENSIONS.some(ext => lower.includes(ext));
}
