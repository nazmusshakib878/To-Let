# বাসা খুঁজি (Basha Khuji) — Khulna City To-Let Platform

একটি আধুনিক, নিরাপদ এবং পূর্ণাঙ্গ ফুল-স্ট্যাক বাসা ভাড়া খোঁজার প্ল্যাটফর্ম — যা বিশেষভাবে খুলনা শহরের ৩১টি ওয়ার্ড এবং প্রধান এলাকাগুলোর জন্য ডিজাইন করা হয়েছে।

---

## 🌟 প্রধান সুবিধাসমূহ (Key Features)

### ১. খুলনা শহরের ডেডিকেটেড লোকেশন সিস্টেম
- খুলনা সিটি কর্পোরেশনের ৩১টি ওয়ার্ড এবং প্রধান এলাকা (যেমন: সোনাডাঙ্গা, বয়রা, খালিশপুর, দৌলতপুর, নিরালা, শিববাড়ী, রূপসা ইত্যাদি) এর জিপিএস কোঅর্ডিনেট ডাটাবেজ।
- ওয়ার্ড ও এলাকা ভিত্তিক ফিল্টারিং এবং অটোমেটিক লোকেশন সাজেস্ট।

### ২. ইন্টারেক্টিভ খুলনা সিটি ম্যাপ (React Leaflet)
- ওপেনস্ট্রিটম্যাপ ও লিফলেট ভিত্তিক লাইভ সিটি ম্যাপ।
- প্রতিটি প্রপার্টির জন্য কাস্টম মার্কার, ভাড়া ও ছবির প্রিভিউ সহ পপআপ।
- কার্ডে বা ম্যাপে ক্লিক করলে অটোমেটিক সিঙ্ক এবং স্মুথ প্যান/জুম।

### ৩. নতুন ৮টি প্রফেশনাল প্রোডাকশন ফিচার (The 8 Improvements)

1. **প্রোডাকশন গ্রেড সিকিউরিটি (Production Security):**
   - **Helmet:** সিকিউর HTTP হেডার্স (Leaflet টাইল ও Cloudinary ইমেজের জন্য কাস্টম CSP সহ)।
   - **Rate Limiting:** ব্রুট-ফোর্স ও স্প্যাম প্রতিরোধে রিকোয়েস্ট লিমিট (জেনারেল, প্রপার্টি পোস্ট, এবং রিপোর্ট লিমিটার)।
   - **Compression:** দ্রুত লোডিংয়ের জন্য রেসপন্স কম্প্রেশন।
   - **CORS Protection:** ফ্রন্টএন্ড অরিজিন রেস্ট্রিকশন।

2. **ক্লাউড-রেডি ডাটাবেজ (Cloud-Ready Database):**
   - ডেভেলপমেন্টে লোকাল SQLite এবং প্রোডাকশনে PostgreSQL (Neon / Supabase / Railway) সরাসরি ব্যবহারের জন্য প্রস্তুত Prisma ORM স্কিমা।

3. **ক্লাউড ইমেজ স্টোরেজ (Persistent Cloud Media):**
   - Cloudinary ইন্টিগ্রেশন। ক্লাউড এপিআই কি দিলে সরাসরি ক্লাউডে সেভ হবে, আর কি না দিলে স্বয়ংক্রিয়ভাবে লোকাল ডিস্কে স্টোর হবে (জিরো-কনফিগ ডেভেলপমেন্ট)।
   - প্রপার্টি ডিলিট করলে স্টোরেজ থেকেও স্বয়ংক্রিয়ভাবে ইমেজ ক্লিনআপ।

4. **সরাসরি হোয়াটসঅ্যাপ যোগাযোগ (WhatsApp Direct Chat):**
   - যেকোনো বাংলাদেশি নম্বরকে (`01XXXXXXXX`, `+8801...`, `8801...`) স্বয়ংক্রিয়ভাবে নরমালাইজ করে সরাসরি `wa.me` লিঙ্ক তৈরি।
   - বাড়িওয়ালার কাছে স্বয়ংক্রিয় বাংলা বার্তা সহ ওয়ান-ক্লিক চ্যাট সুবিধা।

5. **ভাড়া হয়ে গেছে মার্ক করার সুবিধা (Mark as Rented):**
   - পোস্ট করার সময় প্রাপ্ত গোপন ডিলিট/ম্যানেজ টোকেন দিয়ে বাড়িওয়ালা প্রপার্টিটিকে **"ভাড়া হয়ে গেছে"** অথবা **"পুনরায় ফাঁকা আছে"** স্ট্যাটাসে টগল করতে পারেন।
   - কার্ড ও ম্যাপ পিনের উপর আকর্ষণীয় ব্যাজ ও অপাসিটি আপডেট।

6. **স্বয়ংক্রিয় মেয়াদোত্তীর্ণ ও রিনিউ (Automatic Expiry & 30-Day Renewal):**
   - পোস্ট করার পর থেকে ৩০ দিনের লাইফসাইকেল।
   - আর কত দিন বাকি আছে তার কাউন্টডাউন ব্যাজ।
   - বাড়িওয়ালা তাদের টোকেন ব্যবহার করে আরও ৩০ দিনের জন্য মেয়াদ বাড়িয়ে নিতে পারেন (Renew Button)।

7. **ভুয়া বিজ্ঞাপন রিপোর্ট সিস্টেম (Fake Listing Reporting):**
   - ইউজাররা কোনো পোস্ট ভুয়া বা বিভ্রান্তিকর মনে হলে সরাসরি কারণ উল্লেখ করে রিপোর্ট করতে পারেন।
   - ডাটাবেজে অডিট লগ সংরক্ষিত হয় এবং স্প্যাম রোধে আইপি-রেট-লিমিট যুক্ত।

8. **এসইও এবং সোশ্যাল মিডিয়া শেয়ারিং (SEO & Social Sharing):**
   - Facebook, WhatsApp, Telegram প্রিভিউয়ের জন্য OpenGraph এবং Twitter Card মেটা ট্যাগ।
   - গুগল সার্চ ইঞ্জিনের জন্য Schema.org `RealEstateListing` Structured Data।
   - ওয়ান-ক্লিক Web Share API এবং ব্রাউজারে স্বয়ংক্রিয় ক্লিপবোর্ড কপি ফলব্যাক।

---

## 🛠️ টেকনোলজি স্ট্যাক (Tech Stack)

- **Frontend:** React 19, TypeScript, Vite, React-Leaflet, Leaflet, Lucide Icons, Vanilla CSS
- **Backend:** Node.js, Express, TypeScript, Prisma ORM, Multer
- **Database:** SQLite (লোকাল ডেভেলপমেন্ট) / PostgreSQL (প্রোডাকশন ক্লাউড রেডি)
- **Security:** Helmet, express-rate-limit, compression, cors
- **Testing:** Vitest, Supertest

---

## 🚀 লোকাল সেটআপ ও রান করার নিয়ম (Local Development)

### ১. প্রজেক্ট ক্লোন ও ডিপেন্ডেন্সি ইনস্টল:
```bash
git clone https://github.com/nazmusshakib878/To-Let.git
cd To-Let
npm install
```

### ২. এনভায়রনমেন্ট ভ্যারিয়েবল প্রস্তুতকরণ:
- `backend/.env.example` ফাইলটি কপি করে `backend/.env` তৈরি করুন:
```bash
cp backend/.env.example backend/.env
```

### ৩. ডাটাবেজ মাইগ্রেশন ও সিড ডেটা:
```bash
npm --workspace=backend run db:push
npm --workspace=backend run db:seed
```

### ৪. লোকাল সার্ভার চালু:
```bash
npm run dev
```
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000

---

## ☁️ ক্লাউড কনফিগারেশন নির্দেশিকা (Cloud Deployment Ready)

যখন আপনি প্রজেক্টটি লাইভ হোস্ট করতে চাইবেন:

### ১. ডাটাবেজ (PostgreSQL — Neon / Supabase):
1. [Neon.tech](https://neon.tech) অথবা [Supabase](https://supabase.com) এ একটি ফ্রি PostgreSQL ডাটাবেজ তৈরি করুন।
2. `backend/prisma/schema.prisma` ফাইলে `provider = "sqlite"` এর বদলে `provider = "postgresql"` করুন।
3. আপনার প্রোডাকশন সার্ভারে `DATABASE_URL` সেট করুন:
   ```env
   DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"
   ```
4. মাইগ্রেশন চালান: `npx prisma db push`

### ২. ইমেজ স্টোরেজ (Cloudinary):
1. [Cloudinary.com](https://cloudinary.com) এ ফ্রি একাউন্ট খুলে ড্যাশবোর্ড থেকে ক্রেডেনশিয়াল সংগ্রহ করুন।
2. আপনার ব্যাকএন্ডের `.env` বা হোস্টিং এনভায়রনমেন্টে যুক্ত করুন:
   ```env
   CLOUDINARY_CLOUD_NAME="your-cloud-name"
   CLOUDINARY_API_KEY="your-api-key"
   CLOUDINARY_API_SECRET="your-api-secret"
   ```
3. এখন সমস্ত আপলোড করা ছবি স্বয়ংক্রিয়ভাবে Cloudinary ক্লাউড CDN-এ পারসিস্টেন্ট হিসেবে সেভ হবে।

---

## 🧪 টেস্ট রান করা (Running Tests)

ব্যাকএন্ডের সমস্ত সিকিউরিটি, রেট-লিমিট ও এপিআই টেস্ট করার জন্য:
```bash
npm --workspace=backend run test
```
সকল ১০টি ইউনিট ও ইন্টিগ্রেশন টেস্ট সফলভাবে পাস করবে।

---

## 📄 লাইসেন্স
MIT License. ব্যক্তিগত ও বাণিজ্যিক ব্যবহারের জন্য উন্মুক্ত।
