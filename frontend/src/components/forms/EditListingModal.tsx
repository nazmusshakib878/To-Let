import React, { useState, useEffect } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import { Listing, TenantType, UpdateListingPayload } from '../../types/listing';
import { listingService } from '../../services/listingService';
import { DEFAULT_AREAS } from '../../constants/areas';
import { ImageUploadPreview } from './ImageUploadPreview';

interface EditListingModalProps {
  listing: Listing | null;
  isOpen: boolean;
  onClose: () => void;
  token: string;
  onSuccess: () => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

export const EditListingModal: React.FC<EditListingModalProps> = ({
  listing,
  isOpen,
  onClose,
  token,
  onSuccess,
  showToast,
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loc, setLoc] = useState('');
  const [addr, setAddr] = useState('');
  const [rent, setRent] = useState<number | ''>('');
  const [rooms, setRooms] = useState<number>(1);
  const [floor, setFloor] = useState<number>(1);
  const [maxOccupants, setMaxOccupants] = useState<number>(1);
  const [tenantType, setTenantType] = useState<TenantType>('family');
  const [rulesText, setRulesText] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (listing) {
      setName(listing.name);
      setPhone(listing.phone);
      setLoc(listing.loc);
      setAddr(listing.addr);
      setRent(listing.rent);
      setRooms(listing.rooms);
      setFloor(listing.floor);
      setMaxOccupants(listing.max);
      setTenantType(listing.type);
      setRulesText(listing.rules ? listing.rules.join('\n') : '');
      setPreviewUrl(listing.imageUrl || null);
    }
  }, [listing]);

  if (!isOpen || !listing) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      showToast('অননুমোদিত: এই পোস্ট এডিট করার সিক্রেট টোকেন নেই', 'error');
      return;
    }

    const numRent = typeof rent === 'number' ? rent : parseInt(rent, 10);
    if (isNaN(numRent) || numRent < 500) {
      showToast('মাসিক ভাড়া কমপক্ষে ৫০০ ৳ দিন', 'error');
      return;
    }

    const rulesList = rulesText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const payload: UpdateListingPayload = {
      name: name.trim() || listing.name,
      phone: phone.trim() || listing.phone,
      loc: loc || listing.loc,
      addr: addr.trim() || listing.addr,
      rent: numRent,
      rooms,
      floor,
      maxOccupants,
      tenantType,
      rules: rulesList,
      photoFile,
    };

    setIsSubmitting(true);
    try {
      await listingService.updateListing(listing.id, token, payload);
      showToast('বিজ্ঞাপন সফলভাবে আপডেট করা হয়েছে!', 'success');
      onSuccess();
      onClose();
    } catch (err: any) {
      showToast(err?.message || 'বিজ্ঞাপন আপডেট করতে ব্যর্থ হয়েছে', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="modal-backdrop animate-fade-in"
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 21, 0.75)',
        backdropFilter: 'blur(6px)',
        zIndex: 10001,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        overflowY: 'auto',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="modal-content"
        style={{
          background: 'var(--card)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--line)',
          maxWidth: '640px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: 'var(--shadow-lg)',
          padding: '24px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ margin: 0, fontSize: '20px', color: 'var(--ink)' }}>
            বিজ্ঞাপন সংশোধন করুন
          </h2>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--mute)' }}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid">
            <div>
              <label htmlFor="eName">আপনার নাম</label>
              <input id="eName" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>

            <div>
              <label htmlFor="ePhone">ফোন নম্বর</label>
              <input id="ePhone" value={phone} onChange={(e) => setPhone(e.target.value)} required />
            </div>

            <div>
              <label htmlFor="eLoc">এলাকা</label>
              <select id="eLoc" value={loc} onChange={(e) => setLoc(e.target.value)}>
                {DEFAULT_AREAS.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="eAddr">ঠিকানা / ল্যান্ডমার্ক</label>
              <input id="eAddr" value={addr} onChange={(e) => setAddr(e.target.value)} required />
            </div>

            <div>
              <label htmlFor="eRent">মাসিক ভাড়া (৳)</label>
              <input
                id="eRent"
                type="number"
                min={500}
                value={rent}
                onChange={(e) => setRent(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                required
              />
            </div>

            <div>
              <label htmlFor="eRooms">রুম সংখ্যা</label>
              <input
                id="eRooms"
                type="number"
                min={1}
                value={rooms}
                onChange={(e) => setRooms(parseInt(e.target.value, 10) || 1)}
              />
            </div>

            <div>
              <label htmlFor="eFloor">তলা</label>
              <input
                id="eFloor"
                type="number"
                min={0}
                value={floor}
                onChange={(e) => setFloor(parseInt(e.target.value, 10) || 0)}
              />
            </div>

            <div>
              <label htmlFor="eMax">সর্বোচ্চ সদস্য</label>
              <input
                id="eMax"
                type="number"
                min={1}
                value={maxOccupants}
                onChange={(e) => setMaxOccupants(parseInt(e.target.value, 10) || 1)}
              />
            </div>

            <div>
              <label htmlFor="eType">কাদের জন্য</label>
              <select
                id="eType"
                value={tenantType}
                onChange={(e) => setTenantType(e.target.value as TenantType)}
              >
                <option value="family">ফ্যামিলি</option>
                <option value="bachelor">ব্যাচেলর</option>
                <option value="any">যে কেউ</option>
              </select>
            </div>
          </div>

          <div style={{ marginTop: '14px' }}>
            <label htmlFor="eRules">বাসার নিয়ম (প্রতি লাইনে একটি)</label>
            <textarea
              id="eRules"
              value={rulesText}
              onChange={(e) => setRulesText(e.target.value)}
            />
          </div>

          <ImageUploadPreview
            previewUrl={previewUrl}
            onImageSelected={(file, url) => {
              setPhotoFile(file);
              setPreviewUrl(url);
            }}
            onError={(msg) => showToast(msg, 'error')}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
            <button type="button" className="btn ghost" onClick={onClose} disabled={isSubmitting}>
              বাতিল
            </button>
            <button type="submit" className="btn" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> সংরক্ষণ হচ্ছে...
                </>
              ) : (
                <>
                  <Save size={16} /> সংরক্ষণ করুন
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
