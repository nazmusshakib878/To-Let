import React, { useEffect, useState } from 'react';
import { listingService } from '../../services/listingService';

export const Footer: React.FC = () => {
  const [isConnected, setIsConnected] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;
    listingService
      .getHealth()
      .then(() => {
        if (mounted) setIsConnected(true);
      })
      .catch(() => {
        if (mounted) setIsConnected(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <footer className="foot">
      <div>
        ডেমো সংস্করণ: নতুন পোস্ট করা তথ্য SQLite ডাটাবেসে স্থায়ীভাবে সেভ থাকে।
      </div>
      <div className="status-badge">
        <span
          className="status-dot"
          style={{
            backgroundColor: isConnected ? '#27ae60' : '#e74c3c',
            boxShadow: isConnected
              ? '0 0 0 2px rgba(39, 174, 96, 0.2)'
              : '0 0 0 2px rgba(231, 76, 60, 0.2)',
          }}
        />
        <span>{isConnected ? 'ডাটাবেস সংযুক্ত' : 'সার্ভার সংযোগ বিচ্ছিন্ন'}</span>
      </div>
    </footer>
  );
};
