import React from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  listingTitle: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  listingTitle,
  onConfirm,
  onCancel,
  isDeleting,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onCancel} role="dialog" aria-modal="true">
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <div
            style={{
              background: 'var(--danger-bg)',
              color: 'var(--danger)',
              padding: '8px',
              borderRadius: '50%',
              display: 'flex',
            }}
          >
            <AlertTriangle size={24} />
          </div>
          <h3 className="modal-title">বিজ্ঞাপনটি মুছে ফেলবেন?</h3>
        </div>

        <p className="modal-text">
          আপনি কি নিশ্চিত যে <strong>{listingTitle}</strong> এর এই বিজ্ঞাপনটি স্থায়ীভাবে মুছে ফেলতে
          চান? একবার মুছে ফেললে এটি আর পুনরুদ্ধার করা সম্ভব হবে না।
        </p>

        <div className="modal-actions">
          <button type="button" className="btn ghost" onClick={onCancel} disabled={isDeleting}>
            বাতিল
          </button>
          <button
            type="button"
            className="btn danger"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            <Trash2 size={16} />
            {isDeleting ? 'মোছা হচ্ছে...' : 'হ্যাঁ, মুছে ফেলুন'}
          </button>
        </div>
      </div>
    </div>
  );
};
