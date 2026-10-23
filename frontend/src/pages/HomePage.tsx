import React from 'react';
import {
  Search,
  PlusCircle,
  MapPin,
  Home,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Map,
  Compass,
  Building2,
} from 'lucide-react';
import { Listing, ListingFilterQuery, TenantType } from '../types/listing';
import { LocationItem } from '../types/location';
import { LocationAutocomplete } from '../components/location/LocationAutocomplete';
import { ListingCard } from '../components/listings/ListingCard';
import { bn } from '../utils/bengali';
import { KhulnaMap } from '../components/map/KhulnaMap';

const POPULAR_KHULNA_AREAS = [
  { name: 'সোনাডাঙ্গা', nameEn: 'Sonadanga', ward: 17, desc: 'বাস টার্মিনাল ও প্রধান বাণিজ্যিক কেন্দ্র' },
  { name: 'বয়রা', nameEn: 'Boyra', ward: 15, desc: 'শান্ত আবাসিক এলাকা ও স্কুল-কলেজ সংলগ্ন' },
  { name: 'খালিশপুর', nameEn: 'Khalishpur', ward: 8, desc: 'শিল্পাঞ্চল ও সুলভ ভাড়ার বাসা' },
  { name: 'নিরালা', nameEn: 'Nirala', ward: 24, desc: 'অভিজাত আবাসিক পরিবেশ ও নিরিবিলি এলাকা' },
  { name: 'মুজগুন্নী', nameEn: 'Mujgunni', ward: 9, desc: 'মহাসড়ক সংলগ্ন প্রশস্ত আবাসিক জোন' },
  { name: 'টুটপাড়া', nameEn: 'Tutpara', ward: 30, desc: 'ঐতিহ্যবাহী লোকালয় ও সাশ্রয়ী মেস' },
  { name: 'গল্লামারী', nameEn: 'Gollamari', ward: 26, desc: 'খুলনা বিশ্ববিদ্যালয় (KU) সংলগ্ন শিক্ষার্থী বান্ধব' },
  { name: 'দৌলতপুর', nameEn: 'Daulatpur', ward: 4, desc: 'রেলওয়ে স্টেশন ও প্রধান বাজার নিকটবর্তী' },
];

interface HomePageProps {
  listings: Listing[];
  onNavigateToSearch: (filters?: Partial<ListingFilterQuery>) => void;
  onNavigateToPost: () => void;
  onViewDetails: (listing: Listing) => void;
  isMyListing: (id: number) => boolean;
  onCopyPhone: (phone: string) => void;
  onDeleteRequest: (listing: Listing) => void;
  onToggleRented?: (listing: Listing) => void;
  onRenewListing?: (listing: Listing) => void;
  onEditRequest?: (listing: Listing) => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  listings,
  onNavigateToSearch,
  onNavigateToPost,
  onViewDetails,
  isMyListing,
  onCopyPhone,
  onDeleteRequest,
  onToggleRented,
  onRenewListing,
  onEditRequest,
  onShowToast,
}) => {
  const [selectedLocation, setSelectedLocation] = React.useState<string>('');
  const [selectedMaxRent, setSelectedMaxRent] = React.useState<number | undefined>(undefined);
  const [selectedTenantType, setSelectedTenantType] = React.useState<TenantType | ''>('');

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onNavigateToSearch({
      loc: selectedLocation || undefined,
      maxRent: selectedMaxRent,
      type: selectedTenantType || undefined,
    });
  };

  // Real statistics derived purely from database records
  const totalActive = listings.filter((l) => !l.isRented).length;
  const totalRented = listings.filter((l) => l.isRented).length;
  const recentListings = [...listings]
    .filter((l) => !l.isRented)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6);

  return (
    <div className="home-container animate-fade-in">
      {/* 1. HERO SECTION */}
      <section
        className="hero-section"
        style={{
          background: 'linear-gradient(135deg, var(--gt) 0%, var(--card) 100%)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--line)',
          padding: '40px 24px',
          boxShadow: 'var(--shadow-md)',
          marginBottom: '36px',
        }}
      >
        <div style={{ maxWidth: '820px', margin: '0 auto', textAlign: 'center' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: 'var(--radius-pill)',
              background: 'var(--card)',
              border: '1px solid var(--line)',
              fontSize: '13px',
              fontWeight: 600,
              color: 'var(--g)',
              marginBottom: '16px',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <Compass size={16} />
            <span>খুলনা সিটি কর্পোরেশনের ৩১টি ওয়ার্ড ও পার্শ্ববর্তী এলাকা</span>
          </div>

          <h1
            style={{
              fontSize: 'clamp(26px, 4vw, 38px)',
              fontWeight: 800,
              color: 'var(--ink)',
              margin: '0 0 14px 0',
              lineHeight: 1.25,
            }}
          >
            খুলনায় সরাসরি বাড়িওয়ালার বাসা ও মেস ভাড়া
          </h1>

          <p
            style={{
              fontSize: '16px',
              color: 'var(--mute)',
              margin: '0 0 28px 0',
              lineHeight: 1.6,
            }}
          >
            কোনো মধ্যস্বত্বভোগী বা দালাল ছাড়া সরাসরি মালিকের সাথে যোগাযোগ করুন। ইন্টারেক্টিভ ম্যাপে সঠিক অবস্থান, ছবি, ভাড়া ও ভাড়ার নিয়ম জেনে পছন্দ করুন আপনার নতুন ঠিকানা।
          </p>

          {/* Quick Search Form */}
          <form
            onSubmit={handleHeroSearch}
            style={{
              background: 'var(--card)',
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--line)',
              boxShadow: 'var(--shadow-lg)',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '12px',
              alignItems: 'end',
              textAlign: 'left',
            }}
          >
            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)', marginBottom: '4px' }}>
                এলাকা / ওয়ার্ড
              </label>
              <LocationAutocomplete
                placeholder="যেমন: সোনাডাঙ্গা, নিরালা, বয়রা..."
                initialValue={selectedLocation}
                onSelect={(loc: LocationItem | null) => {
                  setSelectedLocation(loc ? loc.nameBn : '');
                }}
              />
            </div>

            <div>
              <label htmlFor="heroRent" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)', marginBottom: '4px' }}>
                সর্বোচ্চ বাজেট (৳)
              </label>
              <input
                id="heroRent"
                type="number"
                min={500}
                step={500}
                placeholder="যেমন: ৫০০০ ৳"
                value={selectedMaxRent || ''}
                onChange={(e) =>
                  setSelectedMaxRent(e.target.value ? parseInt(e.target.value, 10) : undefined)
                }
              />
            </div>

            <div>
              <label htmlFor="heroTenant" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)', marginBottom: '4px' }}>
                ভাড়াটিয়ার ধরন
              </label>
              <select
                id="heroTenant"
                value={selectedTenantType}
                onChange={(e) => setSelectedTenantType(e.target.value as TenantType | '')}
              >
                <option value="">যেকোনো</option>
                <option value="family">ফ্যামিলি</option>
                <option value="bachelor">ব্যাচেলর</option>
              </select>
            </div>

            <button
              type="submit"
              className="btn"
              style={{
                height: '42px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                fontWeight: 700,
              }}
            >
              <Search size={16} />
              <span>বাসা খুঁজুন</span>
            </button>
          </form>

          {/* Real Metrics Banner (Purely derived from database records) */}
          <div
            style={{
              marginTop: '24px',
              display: 'flex',
              justifyContent: 'center',
              gap: '24px',
              flexWrap: 'wrap',
              fontSize: '13px',
              color: 'var(--mute)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={16} color="var(--g)" />
              <span><strong>{bn(totalActive)}টি</strong> বর্তমান উপলব্ধ বাসা</span>
            </div>
            {totalRented > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={16} color="var(--ink)" />
                <span><strong>{bn(totalRented)}টি</strong> সফলভাবে ভাড়া সম্পন্ন</span>
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Building2 size={16} color="var(--g)" />
              <span><strong>৩১টি</strong> কেসিসি ওয়ার্ড কভারেজ</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={16} color="var(--g)" />
              <span>১০০% সরাসরি বাড়িওয়ালার সাথে যোগাযোগ</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. POPULAR KHULNA AREAS */}
      <section style={{ marginBottom: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <h2 style={{ margin: '0 0 4px 0', fontSize: '22px', fontWeight: 700, color: 'var(--ink)' }}>
              খুলনার জনপ্রিয় আবাসিক এলাকাসমূহ
            </h2>
            <p style={{ margin: 0, fontSize: '14px', color: 'var(--mute)' }}>
              নির্দিষ্ট এলাকায় ক্লিক করে সরাসরি সেই এলাকার ভাড়ার বাসা দেখুন
            </p>
          </div>

          <button
            type="button"
            className="btn ghost"
            onClick={() => onNavigateToSearch()}
            style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <span>সকল এলাকা দেখুন</span>
            <ArrowRight size={14} />
          </button>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: '14px',
          }}
        >
          {POPULAR_KHULNA_AREAS.map((area) => (
            <div
              key={area.name}
              onClick={() => onNavigateToSearch({ loc: area.name })}
              style={{
                padding: '16px',
                background: 'var(--card)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--line)',
                boxShadow: 'var(--shadow-sm)',
                cursor: 'pointer',
                transition: 'var(--transition)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--g)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--line)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--gt)',
                  color: 'var(--g)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <MapPin size={20} />
              </div>

              <div>
                <div style={{ fontWeight: 700, fontSize: '16px', color: 'var(--ink)' }}>
                  {area.name}
                  <span style={{ fontSize: '11px', color: 'var(--mute)', fontWeight: 500, marginLeft: '6px' }}>
                    (ওয়ার্ড {bn(area.ward)})
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--mute)', marginTop: '2px', lineHeight: 1.4 }}>
                  {area.desc}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. RECENTLY ADDED LISTINGS */}
      <section style={{ marginBottom: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <h2 style={{ margin: '0 0 4px 0', fontSize: '22px', fontWeight: 700, color: 'var(--ink)' }}>
              সম্প্রতি পোস্টকৃত বাসা ও মেস
            </h2>
            <p style={{ margin: 0, fontSize: '14px', color: 'var(--mute)' }}>
              সরাসরি মালিক কর্তৃক প্রকাশিত সর্বশেষ বিজ্ঞাপনের তালিকা
            </p>
          </div>

          <button
            type="button"
            className="btn ghost"
            onClick={() => onNavigateToSearch({ sort: 'new' })}
            style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <span>সবগুলো দেখুন ({bn(listings.length)})</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {recentListings.length > 0 ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '20px',
            }}
          >
            {recentListings.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                isOwner={isMyListing(listing.id)}
                onCopyPhone={onCopyPhone}
                onDeleteRequest={onDeleteRequest}
                onToggleRented={onToggleRented}
                onRenewListing={onRenewListing}
                onViewDetails={onViewDetails}
                onEditRequest={onEditRequest}
                onShowToast={onShowToast}
              />
            ))}
          </div>
        ) : (
          <div className="empty">
            <Home size={32} color="var(--mute)" />
            <p>বর্তমানে কোনো সক্রিয় বিজ্ঞাপন নেই। প্রথম বিজ্ঞাপনটি আপনি পোস্ট করুন!</p>
          </div>
        )}
      </section>

      {/* 4. INTERACTIVE KHULNA MAP TEASER */}
      <section
        style={{
          marginBottom: '40px',
          background: 'var(--card)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--line)',
          padding: '24px',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <h2 style={{ margin: '0 0 4px 0', fontSize: '22px', fontWeight: 700, color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Map size={22} color="var(--g)" />
              খুলনা সিটির ইন্টারেক্টিভ ম্যাপ ভিউ
            </h2>
            <p style={{ margin: 0, fontSize: '14px', color: 'var(--mute)' }}>
              ম্যাপে সরাসরি পিন দেখে আপনার কর্মস্থল, বিশ্ববিদ্যালয় বা যাতায়াতের সুবিধার ভিত্তিতে বাসা খুঁজুন
            </p>
          </div>

          <button
            type="button"
            className="btn"
            onClick={() => onNavigateToSearch()}
            style={{ fontSize: '13px' }}
          >
            পূর্ণাঙ্গ ম্যাপে দেখুন
          </button>
        </div>

        <KhulnaMap
          listings={listings}
          onSelectListing={onViewDetails}
          height="400px"
        />
      </section>

      {/* 5. HOW IT WORKS */}
      <section
        style={{
          marginBottom: '40px',
          padding: '32px 24px',
          background: 'var(--gt)',
          borderRadius: 'var(--radius-lg)',
        }}
      >
        <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 28px' }}>
          <h2 style={{ margin: '0 0 6px 0', fontSize: '24px', fontWeight: 800, color: 'var(--ink)' }}>
            বাসা খোঁজা এখন আরও সহজ
          </h2>
          <p style={{ margin: 0, fontSize: '15px', color: 'var(--mute)' }}>
            ৩টি সহজ ধাপে কোনো বাড়তি ফি ছাড়া আপনার পছন্দের বাড়ি বা মেস বেছে নিন
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '20px',
          }}
        >
          <div
            style={{
              background: 'var(--card)',
              padding: '24px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--line)',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: 'var(--gt)',
                color: 'var(--g)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 14px',
                fontWeight: 800,
                fontSize: '18px',
              }}
            >
              ১
            </div>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '17px', color: 'var(--ink)' }}>
              এলাকা ও বাজেট ফিল্টার
            </h3>
            <p style={{ margin: 0, fontSize: '14px', color: 'var(--mute)', lineHeight: 1.5 }}>
              খুলনার নির্দিষ্ট ওয়ার্ড, ভাড়া, রুম সংখ্যা ও ফ্যামিলি বা ব্যাচেলর ফিল্টার দিয়ে সহজেই আপনার উপযোগী বাসা খুঁজুন।
            </p>
          </div>

          <div
            style={{
              background: 'var(--card)',
              padding: '24px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--line)',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: 'var(--gt)',
                color: 'var(--g)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 14px',
                fontWeight: 800,
                fontSize: '18px',
              }}
            >
              ২
            </div>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '17px', color: 'var(--ink)' }}>
              ছবি ও শর্তাবলি যাচাই
            </h3>
            <p style={{ margin: 0, fontSize: '14px', color: 'var(--mute)', lineHeight: 1.5 }}>
              ঘরের ছবি, সুযোগ-সুবিধা, গ্যাস-পানির অবস্থা এবং বাড়িওয়ালার নিয়মাবলি দেখে নিশ্চিত হন।
            </p>
          </div>

          <div
            style={{
              background: 'var(--card)',
              padding: '24px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--line)',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: 'var(--gt)',
                color: 'var(--g)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 14px',
                fontWeight: 800,
                fontSize: '18px',
              }}
            >
              ৩
            </div>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '17px', color: 'var(--ink)' }}>
              সরাসরি মালিকের সাথে চুক্তি
            </h3>
            <p style={{ margin: 0, fontSize: '14px', color: 'var(--mute)', lineHeight: 1.5 }}>
              সরাসরি ফোনে বা WhatsApp-এ কথা বলে সরাসরি বাড়ি পরিদর্শন করুন এবং কোনো ব্রোকার ছাড়া চুক্তি সম্পন্ন করুন।
            </p>
          </div>
        </div>
      </section>

      {/* 6. SAFETY GUIDELINES */}
      <section
        style={{
          marginBottom: '40px',
          background: 'var(--card)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--line)',
          padding: '28px',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
          <ShieldCheck size={24} color="var(--g)" />
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: 'var(--ink)' }}>
            ভাড়াটিয়া ও বাড়িওয়ালাদের জন্য নিরাপত্তা পরামর্শ
          </h2>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '16px',
            fontSize: '14px',
            color: 'var(--ink)',
            lineHeight: 1.6,
          }}
        >
          <div style={{ padding: '12px 16px', background: 'var(--gt)', borderRadius: 'var(--radius-sm)' }}>
            <strong>১. অগ্রিম অর্থ লেনদেনে সতর্কতা:</strong> সরাসরি বাসা না দেখে বা বাড়িওয়ালার পরিচয় যাচাই না করে বিকাশে/নগদে অগ্রিম বুকিং মানি পাঠাবেন না।
          </div>

          <div style={{ padding: '12px 16px', background: 'var(--gt)', borderRadius: 'var(--radius-sm)' }}>
            <strong>২. সরাসরি বাসা পরিদর্শন:</strong> দিনের আলোয় বাসা পরিদর্শন করুন এবং গ্যাস, পানি ও বিদ্যুৎ সরবরাহ নিজ চোখে পরীক্ষা করুন।
          </div>

          <div style={{ padding: '12px 16px', background: 'var(--gt)', borderRadius: 'var(--radius-sm)' }}>
            <strong>৩. লিখিত ভাড়ার চুক্তি:</strong> ভাড়া নেওয়ার পূর্বে জামানত, মাসিক ভাড়া এবং বিল সংক্রান্ত শর্তগুলো স্ট্যাম্প বা কাগজে লিখিত রাখুন।
          </div>

          <div style={{ padding: '12px 16px', background: 'var(--gt)', borderRadius: 'var(--radius-sm)' }}>
            <strong>৪. সন্দেহজনক বিজ্ঞাপনে রিপোর্ট:</strong> কোনো বিজ্ঞাপনে ভুল বা সন্দেহজনক তথ্য দেখতে পেলে কার্ডের "রিপোর্ট" বাটনে ক্লিক করুন।
          </div>
        </div>
      </section>

      {/* 7. POST PROPERTY CTA BANNER */}
      <section
        style={{
          background: 'var(--g)',
          color: '#ffffff',
          borderRadius: 'var(--radius-lg)',
          padding: '36px 24px',
          textAlign: 'center',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        <h2 style={{ fontSize: 'clamp(22px, 3.5vw, 30px)', fontWeight: 800, margin: '0 0 10px 0' }}>
          আপনার বাসা বা মেসের রুম কি খালি আছে?
        </h2>
        <p style={{ fontSize: '16px', opacity: 0.9, maxWidth: '600px', margin: '0 auto 22px', lineHeight: 1.6 }}>
          কোনো চার্জ ছাড়াই আপনার To-Let বিজ্ঞাপন প্রকাশ করুন এবং হাজারো আগ্রহী ভাড়াটিয়ার কাছে পৌঁছে দিন।
        </p>

        <button
          type="button"
          onClick={onNavigateToPost}
          style={{
            background: '#ffffff',
            color: 'var(--g)',
            border: 'none',
            borderRadius: 'var(--radius-sm)',
            padding: '12px 28px',
            fontSize: '16px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: 'var(--shadow-md)',
            transition: 'var(--transition)',
          }}
        >
          <PlusCircle size={20} />
          <span>বিনামূল্যে To-Let পোস্ট করুন</span>
        </button>
      </section>
    </div>
  );
};

export default HomePage;
