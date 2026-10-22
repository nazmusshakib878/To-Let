import React from 'react';
import { CheckCircle2 } from 'lucide-react';

interface ToastProps {
  message: string | null;
}

export const Toast: React.FC<ToastProps> = ({ message }) => {
  if (!message) return null;

  return (
    <div className="toast" role="alert" aria-live="assertive">
      <CheckCircle2 size={18} color="var(--g)" />
      <span>{message}</span>
    </div>
  );
};
