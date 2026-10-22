import React, { useState, useEffect } from 'react';
import { Send, Loader2, MapPin, Crosshair, X, Shield } from 'lucide-react';
import { CreateListingPayload, TenantType } from '../../types/listing';
import { DEFAULT_AREAS } from '../../constants/areas';
import { listingService } from '../../services/listingService';
import { locationService } from '../../services/locationService';
import { isValidBangladeshPhone, bn } from '../../utils/bengali';
import { ImageUploadPreview } from './ImageUploadPreview';
import { MapLocationPicker } from '../map/MapLocationPicker';
import { WardItem } from '../../types/location';

interface PostListingFormProps {
  onSuccess: (listingId: number, deletionToken: string) => void;
  onErrorToast: (message: string) => void;
}

export const PostListingForm: React.FC<PostListingFormProps> = ({
  onSuccess,
  onErrorToast,
}) => {
  const [areas, setAreas] = useState<string[]>(DEFAULT_AREAS);
  const [wards, setWards] = useState<WardItem[]>([]);

  // Form Fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loc, setLoc] = useState(DEFAULT_AREAS[0]);
  const [ward, setWard] = useState<number | undefined>(undefined);
  const [addr, setAddr] = useState('');
  const [rent, setRent] = useState<number | ''>('');
  const [rooms, setRooms] = useState<number>(2);
  const [floor, setFloor] = useState<number>(2);
  const [maxOccupants, setMaxOccupants] = useState<number>(5);
  const [tenantType, setTenantType] = useState<TenantType>('family');
  const [rulesText, setRulesText] = useState('');

  // Geographic fields
  const [latitude, setLatitude] = useState<number | undefined>(undefined);
  const [longitude, setLongitude] = useState<number | undefined>(undefined);
  const [isApproximatePin, setIsApproximatePin] = useState<boolean>(false);
  const [locationId, setLocationId] = useState<number | undefined>(undefined);
  const [isMapPickerOpen, setIsMapPickerOpen] = useState<boolean>(false);

  // Image Upload
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Validation & Loading
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    listingService
      .getAreas()
      .then((data) => {
        if (data && data.length > 0) {
          setAreas(data);
          setLoc(data[0]);
        }
      })
      .catch(() => {});

    locationService
      .getWards()
      .then((data) => setWards(data))
      .catch(() => {});
  }, []);

  const handleLocationPicked = (result: {
    latitude: number;
    longitude: number;
    isApproximatePin: boolean;
    locationName?: string;
    ward?: number;
    locationId?: number;
  }) => {
    setLatitude(result.latitude);
    setLongitude(result.longitude);
    setIsApproximatePin(result.isApproximatePin);
    if (result.locationName) setLoc(result.locationName);
    if (result.ward) setWard(result.ward);
    if (result.locationId) setLocationId(result.locationId);
    setIsMapPickerOpen(false);
  };

  const handleClearLocation = () => {
    setLatitude(undefined);
    setLongitude(undefined);
    setIsApproximatePin(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedName = name.trim();
    const cleanPhone = phone.trim().replace(/[\s-]/g, '');
    const numRent = typeof rent === 'number' ? rent : parseInt(rent, 10);

    const newErrors: Record<string, boolean> = {
      pName: !trimmedName,
      pPhone: !isValidBangladeshPhone(cleanPhone),
      pRent: isNaN(numRent) || numRent < 500,
    };

    setErrors(newErrors);

    if (newErrors.pName) {
      document.getElementById('pName')?.focus();
      onErrorToast('আপনার নাম লিখুন');
      return;
    }

    if (newErrors.pPhone) {
      document.getElementById('pPhone')?.focus();
      onErrorToast('ফোন নম্বর ১১ সংখ্যার হতে হবে, যেমন 01712345678');
      return;
    }

    if (newErrors.pRent) {
      document.getElementById('pRent')?.focus();
      onErrorToast('মাসিক ভাড়া কমপক্ষে ৫০০ ৳ দিন');
      return;
    }

    const rulesList = rulesText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const payload: CreateListingPayload = {
      name: trimmedName,
      phone: cleanPhone,
      loc,
      ward,
      locationId,
      addr: addr.trim() || loc,
      rent: numRent,
      rooms: rooms || 1,
      floor: floor || 1,
      maxOccupants: maxOccupants || 1,
      tenantType,
      rules: rulesList,
      latitude,
      longitude,
      coordinateAccuracy: isApproximatePin ? 'approximate' : 'exact',
      isApproximatePin,
      photoFile,
    };

    setIsSubmitting(true);
    try {
      const response = await listingService.createListing(payload);

      // Reset form
      setName('');
      setPhone('');
      setAddr('');
      setRent('');
      setRulesText('');
      setWard(undefined);
      setLatitude(undefined);
      setLongitude(undefined);
      setIsApproximatePin(false);
      setPhotoFile(null);
      setPreviewUrl(null);
      setErrors({});

      onSuccess(response.data.id, response.deletionToken);
    } catch (err: any) {
      onErrorToast(err?.message || 'বিজ্ঞাপন প্রকাশ করতে ব্যর্থ হয়েছে। আবার চেষ্টা করুন।');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="panel animate-fade-in" onSubmit={handleSubmit} noValidate>
      <div className="grid">
        <div>
          <label htmlFor="pName">আপনার নাম *</label>
          <input
            id="pName"
            placeholder="যেমন: রহিম সাহেব"
            value={name}
            aria-invalid={errors.pName}
            onChange={(e) => {
              setName(e.target.value);
              if (errors.pName) setErrors((prev) => ({ ...prev, pName: false }));
            }}
          />
        </div>

        <div>
          <label htmlFor="pPhone">ফোন নম্বর *</label>
          <input
            id="pPhone"
            type="tel"
            placeholder="01XXXXXXXXX"
            value={phone}
            aria-invalid={errors.pPhone}
            onChange={(e) => {
              setPhone(e.target.value);
              if (errors.pPhone) setErrors((prev) => ({ ...prev, pPhone: false }));
            }}
          />
        </div>

        <div>
          <label htmlFor="pLoc">এলাকা *</label>
          <select id="pLoc" value={loc} onChange={(e) => setLoc(e.target.value)}>
            {areas.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="pWard">কেসিসি ওয়ার্ড (ঐচ্ছিক)</label>
          <select
            id="pWard"
            value={ward ?? ''}
            onChange={(e) =>
              setWard(e.target.value ? parseInt(e.target.value, 10) : undefined)
            }
          >
            <option value="">ওয়ার্ড নির্বাচন করুন</option>
            {wards.map((w) => (
              <option key={w.ward} value={w.ward}>
                ওয়ার্ড {bn(w.ward)} ({w.nameBn.split('(')[1]?.replace(')', '') || w.nameEn})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="pAddr">ঠিকানা / ল্যান্ডমার্ক</label>
          <input
            id="pAddr"
            placeholder="রোড, মসজিদ বা মোড়ের নাম"
            value={addr}
            onChange={(e) => setAddr(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="pRent">মাসিক ভাড়া (৳) *</label>
          <input
            id="pRent"
            type="number"
            min={500}
            step={100}
            placeholder="কমপক্ষে ৫০০ ৳"
            value={rent}
            aria-invalid={errors.pRent}
            onChange={(e) => {
              setRent(e.target.value === '' ? '' : parseInt(e.target.value, 10));
              if (errors.pRent) setErrors((prev) => ({ ...prev, pRent: false }));
            }}
          />
        </div>

        <div>
          <label htmlFor="pRooms">রুম সংখ্যা</label>
          <input
            id="pRooms"
            type="number"
            min={1}
            value={rooms}
            onChange={(e) => setRooms(parseInt(e.target.value, 10) || 1)}
          />
        </div>

        <div>
          <label htmlFor="pFloor">তলা</label>
          <input
            id="pFloor"
            type="number"
            min={0}
            value={floor}
            onChange={(e) => setFloor(parseInt(e.target.value, 10) || 0)}
          />
        </div>

        <div>
          <label htmlFor="pMax">সর্বোচ্চ সদস্য</label>
          <input
            id="pMax"
            type="number"
            min={1}
            value={maxOccupants}
            onChange={(e) => setMaxOccupants(parseInt(e.target.value, 10) || 1)}
          />
        </div>

        <div>
          <label htmlFor="pType">কাদের জন্য</label>
          <select
            id="pType"
            value={tenantType}
            onChange={(e) => setTenantType(e.target.value as TenantType)}
          >
            <option value="family">ফ্যামিলি</option>
            <option value="bachelor">ব্যাচেলর</option>
            <option value="any">যে কেউ</option>
          </select>
        </div>
      </div>

      {/* Interactive Map Location Picker Section */}
      <div
        style={{
          marginTop: '16px',
          padding: '14px',
          background: 'var(--gt)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--line)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <MapPin size={18} color="var(--g)" />
              ম্যাপে বাসার সুনির্দিষ্ট অবস্থান
            </div>
            <div style={{ fontSize: '13px', color: 'var(--mute)' }}>
              ভাড়াটিয়ারা যাতে সহজে বাসা খুঁজে পেতে পারে সেজন্য ম্যাপে পিন করুন
            </div>
          </div>

          <button
            type="button"
            className="btn ghost"
            onClick={() => setIsMapPickerOpen(true)}
            style={{ fontSize: '13px', padding: '8px 14px' }}
          >
            <Crosshair size={15} />
            {latitude && longitude ? 'অবস্থান পরিবর্তন করুন' : 'ম্যাপে পিন করুন'}
          </button>
        </div>

        {latitude && longitude && (
          <div
            style={{
              marginTop: '10px',
              padding: '8px 12px',
              background: 'var(--card)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--line)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '13px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ color: 'var(--g)', fontWeight: 700 }}>✓ পিন সংরক্ষিত:</span>
              <span>
                {latitude.toFixed(4)}, {longitude.toFixed(4)}
              </span>
              {isApproximatePin && (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '3px',
                    fontSize: '11px',
                    padding: '1px 6px',
                    borderRadius: 'var(--radius-pill)',
                    background: 'var(--tag-y-bg)',
                    color: 'var(--tag-y-text)',
                  }}
                >
                  <Shield size={11} /> আনুমানিক পিন
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={handleClearLocation}
              style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--danger)', padding: '2px' }}
              title="লোকেশন মুছুন"
            >
              <X size={15} />
            </button>
          </div>
        )}
      </div>

      <div style={{ marginTop: '14px' }}>
        <label htmlFor="pRules">বাসার নিয়ম (প্রতি লাইনে একটি)</label>
        <textarea
          id="pRules"
          placeholder="গ্যাস বিল আলাদা&#10;রাত ১০টার মধ্যে গেট বন্ধ&#10;২ মাসের অগ্রিম"
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
        onError={onErrorToast}
      />

      <div className="row">
        <button type="submit" className="btn" id="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              পোস্ট করা হচ্ছে...
            </>
          ) : (
            <>
              <Send size={16} />
              পোস্ট করুন
            </>
          )}
        </button>
      </div>

      {isMapPickerOpen && (
        <MapLocationPicker
          initialLat={latitude}
          initialLng={longitude}
          initialApproximate={isApproximatePin}
          onConfirm={handleLocationPicked}
          onCancel={() => setIsMapPickerOpen(false)}
        />
      )}
    </form>
  );
};
