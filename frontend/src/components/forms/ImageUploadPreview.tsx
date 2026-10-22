import React, { useRef } from 'react';
import { UploadCloud, X } from 'lucide-react';
import { compressImage } from '../../utils/imageCompression';

interface ImageUploadPreviewProps {
  previewUrl: string | null;
  onImageSelected: (file: File | null, dataUrl: string | null) => void;
  onError: (msg: string) => void;
}

export const ImageUploadPreview: React.FC<ImageUploadPreviewProps> = ({
  previewUrl,
  onImageSelected,
  onError,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      onError('এটি ছবি নয়, দয়া করে অন্য ইমেজ ফাইল নির্বাচন করুন');
      return;
    }

    try {
      // Compress image client-side to save bandwidth
      const compressed = await compressImage(file, 1200, 0.8);
      onImageSelected(compressed.file, compressed.dataUrl);
    } catch {
      // If compression fails, fallback to raw file with dataUrl
      const reader = new FileReader();
      reader.onload = () => {
        onImageSelected(file, reader.result as string);
      };
      reader.onerror = () => {
        onError('ছবি পড়তে ব্যর্থ হয়েছে');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onImageSelected(null, null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div style={{ marginTop: '14px' }}>
      <label htmlFor="pPhoto">রুমের ছবি (ঐচ্ছিক)</label>
      <input
        ref={fileInputRef}
        id="pPhoto"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      {!previewUrl ? (
        <div
          className="upload-dropzone"
          onClick={() => fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              fileInputRef.current?.click();
            }
          }}
        >
          <UploadCloud size={32} color="var(--g)" style={{ margin: '0 auto 8px' }} />
          <p style={{ margin: 0, fontWeight: 600, color: 'var(--ink)' }}>
            ছবি আপলোড করতে ক্লিক করুন
          </p>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--mute)' }}>
            JPEG, PNG বা WebP (সর্বোচ্চ ৫ মেগাবাইট)
          </p>
        </div>
      ) : (
        <div className="prev-container">
          <img src={previewUrl} id="prev" className="prev" alt="ছবির প্রিভিউ" />
          <button
            type="button"
            className="prev-remove"
            onClick={handleRemove}
            title="ছবি সরান"
            aria-label="ছবি সরান"
          >
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
};
