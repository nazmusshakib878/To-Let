import React from 'react';

export const LoadingSkeleton: React.FC = () => {
  return (
    <div className="list">
      {[1, 2, 3].map((n) => (
        <article key={n} className="card" style={{ opacity: 0.8 }}>
          <div className="skeleton" style={{ height: '100%', minHeight: '200px' }} />
          <div className="body" style={{ gap: '12px' }}>
            <div className="skeleton" style={{ height: '30px', width: '40%' }} />
            <div className="skeleton" style={{ height: '20px', width: '30%' }} />
            <div className="skeleton" style={{ height: '16px', width: '70%' }} />
            <div style={{ display: 'flex', gap: '8px', margin: '8px 0' }}>
              <div className="skeleton" style={{ height: '24px', width: '60px', borderRadius: '99px' }} />
              <div className="skeleton" style={{ height: '24px', width: '60px', borderRadius: '99px' }} />
              <div className="skeleton" style={{ height: '24px', width: '70px', borderRadius: '99px' }} />
            </div>
            <div className="skeleton" style={{ height: '40px', width: '50%', borderRadius: '10px', marginTop: 'auto' }} />
          </div>
        </article>
      ))}
    </div>
  );
};
