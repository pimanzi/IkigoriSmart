import { supabase } from '../lib/supabase';
import * as FileSystem from 'expo-file-system/legacy';

const BUCKET = 'predictions_images';

export class ImageUploadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ImageUploadError';
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

export async function uploadPredictionImage(
  imageUri: string,
  authId: string
): Promise<string> {
  const fileInfo = await FileSystem.getInfoAsync(imageUri);
  if (!fileInfo.exists) {
    throw new ImageUploadError('Image file not found. Please take the photo again.');
  }

  const isPng = imageUri.toLowerCase().endsWith('.png');
  const extension = isPng ? 'png' : 'jpg';
  const contentType = isPng ? 'image/png' : 'image/jpeg';
  const filename = `${authId}_${Date.now()}.${extension}`;

  const base64 = await FileSystem.readAsStringAsync(imageUri, {
    encoding: 'base64' as any,
  });

  const bytes = decode(base64);

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(filename, bytes, {
      contentType,
      upsert: false,
    });

  if (uploadError) {
    if (uploadError.message.includes('already exists')) {
      throw new ImageUploadError('An image with this name already exists. Please try again.');
    }
    throw new ImageUploadError(uploadError.message);
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(filename);
  return data.publicUrl;
}
