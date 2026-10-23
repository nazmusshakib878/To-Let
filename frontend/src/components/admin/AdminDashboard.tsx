import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Lock,
  LogOut,
  RefreshCw,
  CheckCircle,
  EyeOff,
  Eye,
  Trash2,
  Check,
} from 'lucide-react';
import { AdminStats, AdminReport } from '../../types/listing';
import { listingService } from '../../services/listingService';
import { bn, formatRent } from '../../utils/bengali';

interface AdminDashboardProps {
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  onRefreshListings?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ showToast, onRefreshListings }) => {
  const [adminKey, setAdminKey] = useState<string>(() => {
    return sessionStorage.getItem('tolet_admin_key') || '';
  });
  const [keyInput, setKeyInput] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [actionInProgress, setActionInProgress] = useState<number | null>(null);

  const fetchAdminData = async (key: string) => {
    setIsLoading(true);
    try {
      const [statsData, reportsData] = await Promise.all([
        listingService.adminGetStats(key),
        listingService.adminGetReports(key),
      ]);
      setStats(statsData);
      setReports(reportsData);
      setIsAuthenticated(true);
      sessionStorage.setItem('tolet_admin_key', key);
    } catch (err: any) {
      setIsAuthenticated(false);
      sessionStorage.removeItem('tolet_admin_key');
      showToast(err?.message || 'অ্যাডমিন কি সঠিক নয় বা সার্ভার সংযোগে সমস্যা', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (adminKey) {
      fetchAdminData(adminKey);
    }
  }, [adminKey]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyInput.trim()) {
      showToast('অনুগ্রহ করে অ্যাডমিন সিক্রেট কি প্রদান করুন', 'error');
      return;
    }
    setAdminKey(keyInput.trim());
  };

  const handleLogout = () => {
    setAdminKey('');
    setKeyInput('');
    setIsAuthenticated(false);
    setStats(null);
    setReports([]);
    sessionStorage.removeItem('tolet_admin_key');
    showToast('অ্যাডমিন সেশন থেকে সফলভাবে লগআউট করা হয়েছে', 'info');
  };

  const handleUpdateReportStatus = async (reportId: number, status: 'reviewed' | 'dismissed') => {
    setActionInProgress(reportId);
    try {
      await listingService.adminUpdateReport(reportId, status, adminKey);
      showToast(status === 'reviewed' ? 'রিপোর্ট পর্যালোচিত চিহ্নিত করা হয়েছে' : 'রিপোর্ট খারিজ করা হয়েছে', 'success');
      fetchAdminData(adminKey);
    } catch (err: any) {
      showToast(err?.message || 'স্ট্যাটাস আপডেট ব্যর্থ হয়েছে', 'error');
    } finally {
      setActionInProgress(null);
    }
  };

  const handleToggleListingActive = async (listingId: number, currentActive: boolean) => {
    setActionInProgress(listingId);
    try {
      await listingService.adminUpdateListingStatus(listingId, { isActive: !currentActive }, adminKey);
      showToast(!currentActive ? 'বিজ্ঞাপনটি পুনরায় লাইভ করা হয়েছে' : 'বিজ্ঞাপনটি সাময়িকভাবে লুকানো হয়েছে', 'success');
      fetchAdminData(adminKey);
      if (onRefreshListings) onRefreshListings();
    } catch (err: any) {
      showToast(err?.message || 'বিজ্ঞাপন স্ট্যাটাস পরিবর্তন ব্যর্থ হয়েছে', 'error');
    } finally {
      setActionInProgress(null);
    }
  };

  const handleDeleteListing = async (listingId: number) => {
    if (!window.confirm('আপনি কি নিশ্চিত যে এই বিজ্ঞাপনটি স্থায়ীভাবে মুছে ফেলতে চান?')) return;

    setActionInProgress(listingId);
    try {
      await listingService.adminDeleteListing(listingId, adminKey);
      showToast('বিজ্ঞাপনটি ডাটাবেস থেকে মুছে ফেলা হয়েছে', 'success');
      fetchAdminData(adminKey);
      if (onRefreshListings) onRefreshListings();
    } catch (err: any) {
      showToast(err?.message || 'বিজ্ঞাপন মুছতে ব্যর্থ হয়েছে', 'error');
    } finally {
      setActionInProgress(null);
    }
  };

  if (!isAuthenticated) {
    return (
      <section className="panel animate-fade-in" style={{ maxWidth: '520px', margin: '30px auto', padding: '32px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'var(--gt)',
              color: 'var(--g)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 14px',
            }}
          >
            <Lock size={26} />
          </div>
          <h2 style={{ margin: '0 0 6px 0', fontSize: '22px', color: 'var(--ink)' }}>
            অ্যাডমিন মডারেশন প্যানেল
          </h2>
          <p style={{ margin: 0, fontSize: '14px', color: 'var(--mute)' }}>
            প্ল্যাটফর্মের রিপোর্ট পর্যালোচনা এবং বিজ্ঞাপন নিয়ন্ত্রণের জন্য সার্ভার সিক্রেট কি দিন
          </p>
        </div>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '16px' }}>
            <label htmlFor="adminKey">ADMIN_API_KEY *</label>
            <input
              id="adminKey"
              type="password"
              placeholder="সার্ভার এনভায়রনমেন্টের অ্যাডমিন কি দিন..."
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn"
            style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
            disabled={isLoading}
          >
            {isLoading ? 'যাচাই করা হচ্ছে...' : 'প্রবেশ করুন'}
          </button>
        </form>
      </section>
    );
  }

  return (
    <section className="panel animate-fade-in" style={{ marginTop: '20px' }}>
      {/* Admin Top Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          paddingBottom: '16px',
          borderBottom: '1px solid var(--line)',
          marginBottom: '20px',
        }}
      >
        <div>
          <h2 style={{ margin: '0 0 4px 0', fontSize: '22px', color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldAlert size={22} color="var(--g)" />
            অ্যাডমিন ড্যাশবোর্ড ও মডারেশন
          </h2>
          <span style={{ fontSize: '13px', color: 'var(--mute)' }}>
            রিয়েল ডাটাবেস মেট্রিক্স ও ব্যবহারকারীর অভিযোগ পর্যবেক্ষণ
          </span>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            className="btn ghost"
            onClick={() => fetchAdminData(adminKey)}
            disabled={isLoading}
            style={{ fontSize: '13px', padding: '6px 12px' }}
            title="তথ্য রিফ্রেশ করুন"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            <span>রিফ্রেশ</span>
          </button>

          <button
            type="button"
            className="btn ghost"
            onClick={handleLogout}
            style={{ fontSize: '13px', padding: '6px 12px', color: 'var(--danger)' }}
            title="লগআউট করুন"
          >
            <LogOut size={14} />
            <span>লগআউট</span>
          </button>
        </div>
      </div>

      {/* Real Statistics Derived Directly from Database */}
      {stats && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '12px',
            marginBottom: '28px',
          }}
        >
          <div style={{ padding: '14px', background: 'var(--gt)', borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontSize: '12px', color: 'var(--mute)' }}>মোট বিজ্ঞাপন</span>
            <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--g)' }}>{bn(stats.totalListings)}</div>
          </div>

          <div style={{ padding: '14px', background: 'var(--gt)', borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontSize: '12px', color: 'var(--mute)' }}>সক্রিয় বিজ্ঞাপন</span>
            <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--ink)' }}>{bn(stats.activeListings)}</div>
          </div>

          <div style={{ padding: '14px', background: 'var(--gt)', borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontSize: '12px', color: 'var(--mute)' }}>ভাড়া সম্পন্ন</span>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#475569' }}>{bn(stats.rentedListings)}</div>
          </div>

          <div style={{ padding: '14px', background: 'var(--gt)', borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontSize: '12px', color: 'var(--mute)' }}>মেয়াদোত্তীর্ণ</span>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#dc2626' }}>{bn(stats.expiredListings)}</div>
          </div>

          <div style={{ padding: '14px', background: 'var(--gt)', borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontSize: '12px', color: 'var(--mute)' }}>অপেক্ষমাণ রিপোর্ট</span>
            <div style={{ fontSize: '24px', fontWeight: 800, color: stats.pendingReports > 0 ? '#dc2626' : 'var(--g)' }}>
              {bn(stats.pendingReports)}
            </div>
          </div>
        </div>
      )}

      {/* Reports Moderation Table */}
      <div>
        <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 14px 0', color: 'var(--ink)' }}>
          রিপোর্টকৃত বিজ্ঞাপনের তালিকা ({bn(reports.length)}টি)
        </h3>

        {reports.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center', color: 'var(--mute)' }}>
            <CheckCircle size={36} color="var(--g)" style={{ margin: '0 auto 8px', display: 'block' }} />
            কোনো অমীমাংসিত অভিযোগ বা রিপোর্ট নেই। প্ল্যাটফর্ম সম্পূর্ণ পরিষ্কার!
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--line)', color: 'var(--mute)' }}>
                  <th style={{ padding: '10px 8px' }}>বিজ্ঞাপন</th>
                  <th style={{ padding: '10px 8px' }}>অভিযোগের ধরন</th>
                  <th style={{ padding: '10px 8px' }}>বিস্তারিত</th>
                  <th style={{ padding: '10px 8px' }}>রিপোর্টার</th>
                  <th style={{ padding: '10px 8px' }}>স্ট্যাটাস</th>
                  <th style={{ padding: '10px 8px', textAlign: 'right' }}>পদক্ষেপ</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((r) => (
                  <tr key={r.id} style={{ borderBottom: '1px solid var(--line)' }}>
                    <td style={{ padding: '12px 8px' }}>
                      {r.listing ? (
                        <div>
                          <strong>{r.listing.loc}</strong> ({formatRent(r.listing.rent)})
                          <div style={{ fontSize: '11px', color: 'var(--mute)' }}>
                            মালিক: {r.listing.name} ({r.listing.phone})
                          </div>
                          {!r.listing.isActive && (
                            <span style={{ fontSize: '10px', color: '#dc2626', fontWeight: 700 }}>[লুকানো আছে]</span>
                          )}
                        </div>
                      ) : (
                        <span style={{ color: 'var(--mute)' }}>বিজ্ঞাপন মুছে ফেলা হয়েছে</span>
                      )}
                    </td>

                    <td style={{ padding: '12px 8px' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '2px 8px',
                          borderRadius: 'var(--radius-pill)',
                          background: '#fdf0ed',
                          color: '#c0392b',
                          fontWeight: 600,
                          fontSize: '11px',
                        }}
                      >
                        {r.reason === 'fake' && 'ভুয়া তথ্য'}
                        {r.reason === 'incorrect_info' && 'ভুল তথ্য'}
                        {r.reason === 'rented_already' && 'আগেই ভাড়া হয়ে গেছে'}
                        {r.reason === 'fraud' && 'প্রতারণামূলক'}
                        {r.reason === 'other' && 'অন্যান্য'}
                      </span>
                    </td>

                    <td style={{ padding: '12px 8px', maxWidth: '220px', wordBreak: 'break-word' }}>
                      {r.details || <span style={{ color: 'var(--mute)' }}>-</span>}
                    </td>

                    <td style={{ padding: '12px 8px' }}>
                      {r.reporterPhone || <span style={{ color: 'var(--mute)' }}>নাম প্রকাশে অনিচ্ছুক</span>}
                    </td>

                    <td style={{ padding: '12px 8px' }}>
                      <span
                        style={{
                          fontWeight: 700,
                          color:
                            r.status === 'pending'
                              ? '#d97706'
                              : r.status === 'reviewed'
                              ? 'var(--g)'
                              : 'var(--mute)',
                        }}
                      >
                        {r.status === 'pending' && 'অপেক্ষমাণ'}
                        {r.status === 'reviewed' && 'পর্যালোচিত'}
                        {r.status === 'dismissed' && 'খারিজ'}
                      </span>
                    </td>

                    <td style={{ padding: '12px 8px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                        {r.status === 'pending' && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleUpdateReportStatus(r.id, 'reviewed')}
                              disabled={actionInProgress === r.id}
                              style={{
                                background: 'var(--gt)',
                                color: 'var(--g)',
                                border: 'none',
                                borderRadius: '4px',
                                padding: '4px 8px',
                                fontSize: '11px',
                                fontWeight: 600,
                                cursor: 'pointer',
                              }}
                              title="পর্যালোচিত চিহ্নিত করুন"
                            >
                              <Check size={12} style={{ verticalAlign: 'middle', marginRight: '2px' }} />
                              গৃহীত
                            </button>

                            <button
                              type="button"
                              onClick={() => handleUpdateReportStatus(r.id, 'dismissed')}
                              disabled={actionInProgress === r.id}
                              style={{
                                background: '#f1f5f9',
                                color: '#64748b',
                                border: 'none',
                                borderRadius: '4px',
                                padding: '4px 8px',
                                fontSize: '11px',
                                cursor: 'pointer',
                              }}
                              title="রিপোর্ট বাতিল করুন"
                            >
                              খারিজ
                            </button>
                          </>
                        )}

                        {r.listing && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleToggleListingActive(r.listingId, r.listing!.isActive)}
                              disabled={actionInProgress === r.listingId}
                              style={{
                                background: r.listing.isActive ? '#fdf0ed' : 'var(--gt)',
                                color: r.listing.isActive ? '#c0392b' : 'var(--g)',
                                border: 'none',
                                borderRadius: '4px',
                                padding: '4px 8px',
                                fontSize: '11px',
                                fontWeight: 600,
                                cursor: 'pointer',
                              }}
                              title={r.listing.isActive ? 'বিজ্ঞাপনটি জনসম্মুখ থেকে লুকান' : 'বিজ্ঞাপনটি পুনরায় দেখান'}
                            >
                              {r.listing.isActive ? (
                                <>
                                  <EyeOff size={12} style={{ verticalAlign: 'middle', marginRight: '2px' }} /> লুকান
                                </>
                              ) : (
                                <>
                                  <Eye size={12} style={{ verticalAlign: 'middle', marginRight: '2px' }} /> চালু
                                </>
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteListing(r.listingId)}
                              disabled={actionInProgress === r.listingId}
                              style={{
                                background: '#fee2e2',
                                color: '#b91c1c',
                                border: 'none',
                                borderRadius: '4px',
                                padding: '4px 8px',
                                fontSize: '11px',
                                cursor: 'pointer',
                              }}
                              title="বিজ্ঞাপনটি ডাটাবেস থেকে স্থায়ীভাবে মুছে ফেলুন"
                            >
                              <Trash2 size={12} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
};
