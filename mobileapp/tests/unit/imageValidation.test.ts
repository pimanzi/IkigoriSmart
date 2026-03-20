import { isValidImageUri } from '../../src/utils/imageValidation';

describe('isValidImageUri', () => {
  it('accepts all valid image extensions', () => {
    expect(isValidImageUri('file:///storage/photo.jpg')).toBe(true);
    expect(isValidImageUri('file:///storage/photo.jpeg')).toBe(true);
    expect(isValidImageUri('file:///storage/photo.png')).toBe(true);
    expect(isValidImageUri('file:///storage/photo.bmp')).toBe(true);
    expect(isValidImageUri('file:///storage/photo.webp')).toBe(true);
  });

  it('is case-insensitive for extensions', () => {
    expect(isValidImageUri('file:///storage/photo.JPG')).toBe(true);
    expect(isValidImageUri('file:///storage/photo.PNG')).toBe(true);
    expect(isValidImageUri('file:///storage/photo.JPEG')).toBe(true);
  });

  it('always accepts Android content:// URIs regardless of extension', () => {
    expect(isValidImageUri('content://media/external/images/media/1234')).toBe(true);
    expect(isValidImageUri('content://com.android.providers.media/images/5678')).toBe(true);
  });

  it('rejects non-image file types', () => {
    expect(isValidImageUri('file:///storage/document.pdf')).toBe(false);
    expect(isValidImageUri('file:///storage/data.txt')).toBe(false);
    expect(isValidImageUri('file:///storage/video.mp4')).toBe(false);
    expect(isValidImageUri('file:///storage/animation.gif')).toBe(false);
  });
});
