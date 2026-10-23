import { useState, useCallback, useRef } from 'react';

export function useToast() {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = useCallback(
    (message: string, typeOrDuration?: 'success' | 'error' | 'info' | 'warning' | number, duration = 2600) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      setToastMessage(message);
      const effectiveDuration = typeof typeOrDuration === 'number' ? typeOrDuration : duration;
      timerRef.current = setTimeout(() => {
        setToastMessage(null);
        timerRef.current = null;
      }, effectiveDuration);
    },
    []
  );

  return { toastMessage, showToast };
}
