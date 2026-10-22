import React, { useState } from 'react';
import { AlertTriangle, X, Loader2 } from 'lucide-react';
import { Listing } from '../../types/listing';
import { listingService } from '../../services/listingService';

interface ReportModalProps {
  listing: Listing;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

const REPORT_REASONS = [
  { id: 'fake', label: 'ভুয়া বিজ্ঞাপন বা মধ্যস্বত্বভোগী/দালাল' },
  { id: 'rented_already', label: 'বাসা ইতোমধ্যে ভাড়া হয়ে গেছে' },
  { id: 'incorrect_info', label: 'ভুল ভাড়া, ভুল রুম সংখ্যা বা মিথ্যা ঠিকানা' },
  { id: 'fraud', label: 'প্রতারণামূলক আচরণ বা অগ্রিম টাকা দাবি' },
  { id: 'other', label: 'অন্যান্য সমস্যা' },
] as const;

export const ReportModal: React.FC<ReportModalProps> = ({
  listing,
  isOpen,
  onClose,
  onSuccess,
  onError,
}) => {
  const [reason, setReason] = useState<'fake' | 'incorrect_info' | 'rented_already' | 'fraud' | 'other'>('fake');
  const [details, setDetails] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await listingService.reportListing(listing.id, {
        reason,
        details: details.trim() || undefined,
        reporterPhone: phone.trim() || undefined,
      });
      onSuccess('আপনার রিপোর্ট সফলভাবে জমা হয়েছে। মডারেশন টিম এটি যাচাই করবে।');
      onClose();
    } catch (err: any) {
      onError(err.message || 'রিপোর্ট জমা দিতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="modal-backdrop"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="modal-card animate-fade-in"
        style={{
          background: 'var(--bg-card, #ffffff)',
          color: 'var(--fg, #111827)',
          borderRadius: '16px',
          maxWidth: '460px',
          width: '100%',
          boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
          overflow: 'hidden',
          border: '1px solid var(--border, #e5e7eb)',
        }}
      >
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--border, #e5e7eb)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--bg-subtle, #f9fafb)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: '#fee2e2',
                color: '#dc2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AlertTriangle size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>বিজ্ঞাপন রিপোর্ট করুন</h3>
              <p style={{ margin: 0, fontSize: '12px', color: 'var(--mute, #6b7280)' }}>
                {listing.loc} • {listing.addr}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--mute, #6b7280)',
              padding: '4px',
            }}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '20px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>
            রিপোর্টের কারণ নির্বাচন করুন:
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
            {REPORT_REASONS.map((r) => (
              <label
                key={r.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: reason === r.id ? '1.5px solid var(--g, #1f6f54)' : '1px solid var(--border, #e5e7eb)',
                  background: reason === r.id ? 'var(--gt, #e8f5f0)' : 'transparent',
                  cursor: 'pointer',
                  fontSize: '13px',
                }}
              >
                <input
                  type="radio"
                  name="reportReason"
                  value={r.id}
                  checked={reason === r.id}
                  onChange={() => setReason(r.id)}
                  style={{ accentColor: 'var(--g, #1f6f54)' }}
                />
                <span>{r.label}</span>
              </label>
            ))}
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
              অতিরিক্ত তথ্য (ঐচ্ছিক):
            </label>
            <textarea
              rows={3}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="ঘটনা সম্পর্কে সংক্ষেপে লিখুন..."
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid var(--border, #e5e7eb)',
                background: 'var(--bg, #ffffff)',
                color: 'inherit',
                fontFamily: 'inherit',
                fontSize: '13px',
                resize: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
              আপনার মোবাইল নম্বর (ঐচ্ছিক):
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="017XXXXXXXX (প্রয়োজনে যোগাযোগের জন্য)"
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid var(--border, #e5e7eb)',
                background: 'var(--bg, #ffffff)',
                color: 'inherit',
                fontFamily: 'inherit',
                fontSize: '13px',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: '1px solid var(--border, #e5e7eb)',
                background: 'transparent',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '13px',
                color: 'var(--fg, #111827)',
              }}
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                padding: '8px 18px',
                borderRadius: '8px',
                border: 'none',
                background: '#dc2626',
                color: '#ffffff',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>জমা হচ্ছে...</span>
                </>
              ) : (
                <>
                  <AlertTriangle size={16} />
                  <span>রিপোর্ট পাঠান</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
