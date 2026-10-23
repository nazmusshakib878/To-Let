# বাসা খুঁজি (Basha Khuji) — Khulna City To-Let Platform

একটি আধুনিক, নিরাপদ, দৃষ্টিনন্দন এবং স্কেলেবল ফুল-স্ট্যাক বাসা ও মেস ভাড়া খোঁজার প্ল্যাটফর্ম — যা বিশেষভাবে খুলনা সিটি কর্পোরেশনের ৩১টি ওয়ার্ড এবং পার্শ্ববর্তী প্রধান এলাকাগুলোর জন্য নির্মিত।

---

## 🏛️ আর্কিটেকচার ওভারভিউ (Architecture Overview)

```
tolet/
├── backend/                       # Node.js + Express + TypeScript + Prisma ORM
│   ├── prisma/
│   │   ├── schema.prisma          # অ্যাক্টিভ Prisma স্কিমা (SQLite / PostgreSQL)
│   │   ├── schema.sqlite.prisma   # লোকাল ডেভেলপমেন্ট স্কিমা
│   │   ├── schema.postgresql.prisma # প্রোডাকশন ক্লাউড স্কিমা
│   │   └── seed.ts                # খুলনা ৩১ ওয়ার্ড ও লোকেশন হায়ারার্কি সিডার
│   ├── src/
│   │   ├── app.ts                 # Express মিডলওয়্যার, হেলমেট, কর্স ও রুট সেটআপ
│   │   ├── server.ts              # HTTP সার্ভার লিসেনার ও ইনিশিয়ালাইজেশন
│   │   ├── controllers/           # listingController, locationController, adminController
│   │   ├── services/              # বিজনেস লজিক, ফিল্টারিং, অটো-মেয়াদোত্তীর্ণ, ক্লাউড স্টোরেজ
│   │   ├── middleware/            # timingSafeEqual adminAuth, multer upload, rate limiters
│   │   ├── validators/            # Zod স্কিমা ভ্যালিডেশন
│   │   ├── config/                # সেন্ট্রালাইজড এনভায়রনমেন্ট ভ্যারিয়েবল
│   │   └── utils/                 # ক্লাউডিনারি ক্লায়েন্ট, এরর ফরম্যাটার
│   └── tests/                     # ১২টি ইন্টিগ্রেশন ও এপিআই টেস্ট
├── frontend/                      # React 18 + Vite + TypeScript + Modular CSS
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/            # Header, NavigationTabs, Footer
│   │   │   ├── listings/          # ListingCard, ListingList, PropertyDetailsModal, ReportModal
│   │   │   ├── forms/             # PostListingForm, EditListingModal, ImageUploadPreview
│   │   │   ├── map/               # KhulnaMap (React Leaflet), MapViewToggle, CustomMarkers
│   │   │   ├── admin/             # AdminDashboard (সিকিউর অ্যাডমিন পোর্টাল)
│   │   │   └── location/          # LocationAutocomplete (বাংলা/ইংরেজি ডাবল ম্যাচিং)
│   │   ├── pages/                 # HomePage, SearchPage, PostListingPage
│   │   ├── services/              # listingService, locationService (Axios/Fetch)
│   │   ├── hooks/                 # useListings, useToast, useGeolocation
│   │   └── utils/                 # bengali (বাংলা সংখ্যা/ভাড়া), whatsapp, imageCompression
│   └── public/                    # robots.txt, sitemap.xml, favicon
├── scripts/
│   ├── setup.js                   # ওয়ান-ক্লিক ডাটাবেজ পুশ ও সিডিং
│   ├── switch-db-provider.js      # লোকাল SQLite ও প্রোডাকশন PostgreSQL সুইচিং টুল
│   └── postinstall.js             # রেসিলিয়েন্ট Vercel/CI ডিপ্লয়মেন্ট স্ক্রিপ্ট
└── package.json                   # NPM Workspaces রুট কনফিগারেশন
```

---

## 🌟 প্রধান সুবিধাসমূহ (Key Features)

### ১. ডেডিকেটেড খুলনা লোকেশন ও ৩১টি কেসিসি ওয়ার্ড
- খুলনা সিটি কর্পোরেশনের ৩১টি ওয়ার্ড এবং ৫৮+ ভেরিফায়েড মহাল্লা/লোকেশন (সোনাডাঙ্গা, বয়রা, খালিশপুর, নিরালা, মুজগুন্নী, টুটপাড়া, গল্লামারী, দৌলতপুর ইত্যাদি)।
- বাংলা ও ইংরেজি উভয় ভাষায় রিয়েল-টাইম অটোকমপ্লিট এবং ড্রপডাউন সার্চ।
- নতুন এলাকা যুক্ত করার জন্য আইডিয়ম্পোটেন্ট সিডিং ডাটাবেজ।

### ২. ইন্টারেক্টিভ খুলনা সিটি ম্যাপ (React Leaflet)
- ওপেনস্ট্রিটম্যাপ ও রিঅ্যাক্ট-লিফলেট সমন্বয়ে লাইভ ইন্টারেক্টিভ ম্যাপ।
- প্রতিটি প্রপার্টির ভাড়ার ট্যাগ সহ কাস্টম মার্কার।
- কার্ড সিলেক্ট করলে ম্যাপ স্বয়ংক্রিয়ভাবে প্যান/জুম হয়ে মার্কার হাইলাইট করে।
- **৩টি ভিউ মোড:** List View, Map View, এবং Split View (ডেস্কটপ ও ট্যাবলেটে চমৎকার অভিজ্ঞতা)।
- **প্রাইভেসি সেফ পিন:** বাড়িওয়ালা চাইলে আনুমানিক বা নিখুঁত লোকেশন পিন বেছে নিতে পারেন; আনুমানিক পিনে পাবলিক ইউজারদের কাছে বাড়ির সঠিক প্রাইভেট তথ্য সুরক্ষিত থাকে।

### ৩. প্রিমিয়াম হোমপেজ ও রিয়েল ডাটা মেট্রিক্স
- দৃষ্টিনন্দন হিরো ব্যানার ও সরাসরি সার্চ বার।
- **প্রকৃত ডাটাবেজ মেট্রিক্স:** কোনো ভুয়া পরিসংখ্যান বা ফেক রিভিউ নেই; ডাটাবেজের প্রকৃত উপলব্ধ বাসা ও সফল ভাড়ার সংখ্যা প্রদর্শিত হয়।
- খুলনার জনপ্রিয় ৮টি আবাসিক এলাকার শর্টকাট।
- সাম্প্রতিক বাসা ভাড়ার বিজ্ঞাপন এবং ৩-ধাপের "কীভাবে কাজ করে" ও ভাড়ার নিরাপত্তা নির্দেশিকা।

### ৪. বাড়িওয়ালার নিরাপদ লিস্টিং ব্যবস্থাপনা (Owner Management)
- কোনো জটিল রেজিস্ট্রেশন ছাড়াই নিরাপদ ক্রিপ্টোগ্রাফিক ম্যানেজমেন্ট টোকেন।
- **Mark as Rented:** বাসা ভাড়া হয়ে গেলে বাড়িওয়ালা ওয়ান-ক্লিকে "ভাড়া হয়ে গেছে" মার্ক করতে পারেন।
- **Edit Listing:** ছবি, ভাড়া, রুম, নিয়মাবলী বা যোগাযোগের তথ্য যেকোনো সময় এডিট করা যায়।
- **Auto Expiration & 30-Day Renewal:** ৩০ দিন পর বিজ্ঞাপন স্বয়ংক্রিয়ভাবে সার্চ থেকে হাইড হয়; বাড়িওয়ালা রিনিউ বাটনে ক্লিক করে মেয়াদ বৃদ্ধি করতে পারেন।
- **Secure Deletion:** টোকেন যাচাই ছাড়া কোনো ইউজার বা বহিরাগত বিজ্ঞাপন মুছতে পারবে না।

### ৫. সরাসরি হোয়াটসঅ্যাপ ও কল অ্যাকশন
- বাংলাদেশি মোবাইল নম্বর (`01XXXXXXXX`, `+8801...`, `8801...`) স্বয়ংক্রিয়ভাবে আন্তর্জাতিক ফরম্যাটে নরমালাইজেশন।
- ওয়ান-ক্লিকে ভদ্রতাপূর্ণ বাংলা মেসেজ সহ সরাসরি WhatsApp চ্যাট লিঙ্ক (`wa.me`)।

### ৬. ভুয়া বিজ্ঞাপন রিপোর্ট ও সিকিউর অ্যাডমিন মডারেশন
- ইউজাররা স্প্যাম বা ভুয়া লিস্টিং রিপোর্ট করতে পারেন।
- ব্যাকএন্ডে আইপি-রেট-লিমিট ও ডুপ্লিকেট রিপোর্ট প্রোটেকশন।
- **অ্যাডমিন ড্যাশবোর্ড (`/admin`):** `crypto.timingSafeEqual` সুরক্ষিত এপিআই কি ভিত্তিক অ্যাডমিন পোর্টাল।
- রিয়েল-টাইম মেট্রিক্স পরিদর্শন, রিপোর্ট রিভিউ, এবং যেকোনো আপত্তিকর বিজ্ঞাপন সাময়িক হাইড বা ডিলিট করার ক্ষমতা।

### ৭. এন্টারপ্রাইজ গ্রেড সিকিউরিটি
- **Helmet:** সিকিউর HTTP হেডার্স (Leaflet টাইলস ও Cloudinary-এর জন্য কাস্টম CSP সহ)।
- **Rate Limiting:** সাধারণ রিকোয়েস্ট (১০০/১৫ মিনিট), প্রপার্টি পোস্টিং (১০/ঘণ্টা), রিপোর্ট (৫/ঘণ্টা)।
- **Zod Validation:** ইনপুট স্যানিটাইজেশন ও কড়া টাইপ ভ্যালিডেশন।
- **Dual Database Strategy:** লোকাল SQLite জিরো-কনফিগ ডেভেলপমেন্ট; প্রোডাকশনে PostgreSQL সুইচিং।
- **Durable Media Storage:** Cloudinary ক্লাউড স্টোরেজ সাপোর্ট এবং লোকাল ফাইলসিস্টেম অটো-ফলব্যাক।

### ৮. এসইও এবং পারফরম্যান্স অপ্টিমাইজেশন
- OpenGraph ও Twitter Card সোশ্যাল প্রিভিউ মেটা ট্যাগ।
- Google Search Engine Schema.org Structured Data।
- `robots.txt` এবং `sitemap.xml` বিল্ট-ইন।
- কোড-স্প্লিটিং, লেজি লোডিং এবং রেসপন্স কম্প্রেশন (`gzip`)।

---

## 🛠️ টেকনোলজি স্ট্যাক (Tech Stack)

| স্তর | প্রযুক্তি |
|---|---|
| **Frontend** | React 18, Vite, TypeScript, React-Leaflet, Leaflet, Lucide React, Modular CSS |
| **Backend** | Node.js (>=18), Express.js 5, TypeScript, Prisma ORM, Multer, Zod |
| **Database** | SQLite (লোকাল ডেভেলপমেন্ট) / PostgreSQL (Neon, Supabase, Render) |
| **Security** | Helmet, express-rate-limit, cors, compression, crypto.timingSafeEqual |
| **Testing** | Node.js Native Test Runner, tsx (১৭টি পাসিং টেস্ট) |

---

## 🚀 লোকাল রান করার নিয়ম (Local Setup)

উইন্ডোজ ১১, ম্যাক বা লিনাক্সে রুট ফোল্ডার থেকে সম্পূর্ণ অ্যাপ্লিকেশনটি সহজে চালানো যায়:

### ১. ডিপেন্ডেন্সি ইনস্টল:
```bash
npm install
```

### ২. ডাটাবেজ ইনিশিয়ালাইজ ও সিড (SQLite):
```bash
npm run db
```
*(এই কমান্ডটি স্বয়ংক্রিয়ভাবে স্কিমা পুশ করবে, Prisma Client জেনারেট করবে এবং খুলনার ৩১টি ওয়ার্ড ও ডেমো বিজ্ঞাপন সিড করবে)*

### ৩. লোকাল সার্ভার চালু:
```bash
npm run dev
```

- **Frontend:** [http://localhost:5173](http://localhost:5173)
- **Backend API:** [http://localhost:5000](http://localhost:5000)
- **API Health Check:** [http://localhost:5000/api/health](http://localhost:5000/api/health)
- **অ্যাডমিন প্যানেল:** সাইটের "অ্যাডমিন" ট্যাবে যান অথবা কি ব্যবহার করুন: `khulna-tolet-dev-admin-key-2026`

---

## 🧪 টেস্ট ও বিল্ড (Testing & Building)

### সকল টেস্ট রান করা (১৭টি পাসিং টেস্ট):
```bash
npm test
```
- ব্যাকএন্ড এপিআই ও সিকিউরিটি টেস্ট: `npm run test:backend`
- ফ্রন্টএন্ড ইউটিলিটি ও হোয়াটসঅ্যাপ টেস্ট: `npm run test:frontend`

### প্রোডাকশন বিল্ড যাচাই:
```bash
npm run build
```
*(ব্যাকএন্ড `tsc` এবং ফ্রন্টএন্ড `vite build` উভয়ই সফলভাবে সম্পূর্ণ হবে)*

---

## 🗄️ ডাটাবেজ প্রোভাইডার সুইচিং (SQLite <-> PostgreSQL)

লোকাল ডেভেলপমেন্টে SQLite ব্যবহার করা হয়। প্রোডাকশনে ক্লাউড PostgreSQL (Neon / Supabase / Railway) ব্যবহারের জন্য স্ক্রিপ্ট প্রস্তুত রয়েছে:

```bash
# প্রোডাকশন PostgreSQL-এ পরিবর্তন করতে:
npm run db:provider postgresql

# পুনরায় লোকাল SQLite-এ ফিরে আসতে:
npm run db:provider sqlite
```

---

## ☁️ প্রোডাকশন ডেপ্লয়মেন্ট নির্দেশিকা (Deployment Guide)

### ১. ফ্রন্টএন্ড ডেপ্লয়মেন্ট (Vercel)

> [!NOTE]
> পূর্ববর্তী `npm install exited with code 127: sh: prisma: command not found` সমস্যাটি `scripts/postinstall.js` এবং `backend/package.json`-এ `npx prisma generate` ব্যবহারের মাধ্যমে সম্পূর্ণ সমাধান করা হয়েছে। ফ্রন্টএন্ড Vercel-এ স্বতন্ত্রভাবে বিল্ড হয়।

1. Vercel ড্যাশবোর্ডে **Add New Project** থেকে GitHub রিপোজিটরি ইমপোর্ট করুন।
2. প্রজেক্ট সেটিংস নির্বাচন করুন:
   - **Framework Preset:** `Vite`
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
3. Environment Variables:
   - `VITE_API_BASE_URL`: আপনার ডেপ্লয় করা ব্যাকএন্ড API এর URL (যেমন: `https://your-backend.onrender.com/api`)

### ২. ব্যাকএন্ড ডেপ্লয়মেন্ট (Render / Railway)

1. Render-এ **New Web Service** তৈরি করুন এবং রিপোজিটরি লিংক করুন।
2. কনফিগারেশন:
   - **Root Directory:** `backend`
   - **Runtime:** `Node`
   - **Build Command:** `npm run build`
   - **Start Command:** `npm start`
3. Environment Variables:
   - `PORT`: `5000` (বা Render এর স্বয়ংক্রিয় পোর্ট)
   - `NODE_ENV`: `production`
   - `CORS_ORIGIN`: `https://your-frontend.vercel.app`
   - `DATABASE_URL`: আপনার ক্লাউড PostgreSQL কানেকশন স্ট্রিং (Neon / Supabase)
   - `ADMIN_API_KEY`: আপনার নিজস্ব শক্তিশালী অ্যাডমিন পাসওয়ার্ড
   - `CLOUDINARY_CLOUD_NAME`: ক্লাউডিনারি ক্লাউড নাম (অপশনাল, ক্লাউড ইমেজ সেভ করতে)
   - `CLOUDINARY_API_KEY`: ক্লাউডিনারি API Key (অপশনাল)
   - `CLOUDINARY_API_SECRET`: ক্লাউডিনারি Secret (অপশনাল)

---

## 🔐 এনভায়রনমেন্ট ভ্যারিয়েবল রেফারেন্স

### Backend (`backend/.env`):
```env
PORT=5000
NODE_ENV=development
DATABASE_URL="file:./dev.db"
CORS_ORIGIN=http://localhost:5173
UPLOAD_DIR=uploads
MAX_FILE_SIZE_MB=5
ADMIN_API_KEY=khulna-tolet-dev-admin-key-2026
# CLOUDINARY_CLOUD_NAME=your_cloud_name
# CLOUDINARY_API_KEY=your_api_key
# CLOUDINARY_API_SECRET=your_api_secret
```

### Frontend (`frontend/.env`):
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

---

## 📜 এপিআই এন্ডপয়েন্ট ডকুমেনটেশন (API Reference)

| মেথড | এন্ডপয়েন্ট | বিবরণ |
|---|---|---|
| `GET` | `/api/health` | সার্ভার ও ডাটাবেজ স্বাস্থ্য পরীক্ষা |
| `GET` | `/api/locations/wards` | খুলনা সিটির সকল ৩১টি কেসিসি ওয়ার্ড তালিকা |
| `GET` | `/api/locations` | সকল ভেরিফায়েড মহাল্লা ও এলাকা |
| `GET` | `/api/locations/search?q=...` | বাংলা ও ইংরেজি লোকেশন সার্চ |
| `GET` | `/api/listings` | সক্রিয় প্রপার্টি তালিকা ফিল্টার সহ (`loc`, `ward`, `maxRent`, `type`, `rooms`) |
| `POST` | `/api/listings` | নতুন বিজ্ঞাপন পোস্ট (ছবি আপলোড সহ) |
| `PUT` | `/api/listings/:id` | বাড়িওয়ালার বিজ্ঞাপন এডিট (`x-deletion-token` প্রয়োজনীয়) |
| `PATCH` | `/api/listings/:id/rented` | ভাড়া হয়েছে / ফাঁকা আছে টগল (`x-deletion-token` প্রয়োজনীয়) |
| `POST` | `/api/listings/:id/renew` | বিজ্ঞাপনের মেয়াদ আরও ৩০ দিন বৃদ্ধি (`x-deletion-token` প্রয়োজনীয়) |
| `DELETE` | `/api/listings/:id` | বিজ্ঞাপন মুছে ফেলা (`x-deletion-token` প্রয়োজনীয়) |
| `POST` | `/api/listings/:id/report` | ভুয়া বিজ্ঞাপনের বিরুদ্ধে রিপোর্ট দাখিল |
| `GET` | `/api/admin/stats` | অ্যাডমিন ড্যাশবোর্ড পরিসংখ্যান (`x-admin-key` প্রয়োজনীয়) |
| `GET` | `/api/admin/reports` | দাখিলকৃত সকল রিপোর্ট পর্যালোচনা (`x-admin-key` প্রয়োজনীয়) |
| `PATCH` | `/api/admin/reports/:id/status` | রিপোর্টের স্ট্যাটাস পরিবর্তন (`x-admin-key` প্রয়োজনীয়) |
| `PATCH` | `/api/admin/listings/:id/status` | বিজ্ঞাপন হাইড বা রিস্টোর করা (`x-admin-key` প্রয়োজনীয়) |
| `DELETE` | `/api/admin/listings/:id` | অ্যাডমিন কর্তৃক বিজ্ঞাপন স্থায়ী অপসারণ (`x-admin-key` প্রয়োজনীয়) |

---

## 📄 লাইসেন্স
MIT License — খুলনা শহরের সাধারণ মানুষ ও বাড়িওয়ালাদের সুবিধার্থে উন্মুক্ত।
