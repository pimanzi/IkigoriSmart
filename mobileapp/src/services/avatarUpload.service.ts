import { supabase } from '../lib/supabase';
import * as FileSystem from 'expo-file-system/legacy';

const BUCKET = 'avatars';

export class AvatarUploadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AvatarUploadError';
  }
}

function decode(base64: string): Uint8Array {
  const cleanBase64 = base64.includes(',') ? base64.split(',')[1] : base64;
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  const bytes: number[] = [];
  let i = 0;
  const str = cleanBase64.replace(/[^A-Za-z0-9+/]/g, '');

  while (i < str.length) {
    const enc1 = chars.indexOf(str[i++]);
    const enc2 = chars.indexOf(str[i++]);
    const enc3 = chars.indexOf(str[i++]);
    const enc4 = chars.indexOf(str[i++]);

    const chr1 = (enc1 << 2) | (enc2 >> 4);
    const chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
    const chr3 = ((enc3 & 3) << 6) | enc4;

    bytes.push(chr1);
    if (enc3 !== 64) bytes.push(chr2);
    if (enc4 !== 64) bytes.push(chr3);
  }

  return new Uint8Array(bytes);
}

export async function uploadAvatar(
  imageUri: string,
  authId: string
): Promise<string> {
  const fileInfo = await FileSystem.getInfoAsync(imageUri);
  if (!fileInfo.exists) {
    throw new AvatarUploadError('Image file not found. Please select another photo.');
  }

  const filename = `${authId}_avatar.jpg`;
  const contentType = 'image/jpeg';

  const base64 = await FileSystem.readAsStringAsync(imageUri, {
    encoding: 'base64' as any,
  });

  const bytes = decode(base64);

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(filename, bytes, {
      contentType,
      upsert: true,
    });

  if (uploadError) {
    throw new AvatarUploadError(uploadError.message);
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(filename);
  return data.publicUrl;
}
