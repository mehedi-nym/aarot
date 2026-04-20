# আড়ৎ (Aarot)

Bangla-first vegetable eCommerce web app built with React, Tailwind CSS, and Supabase.

## Folder Structure

```text
aarot/
├─ src/
│  ├─ components/
│  │  ├─ admin/
│  │  ├─ checkout/
│  │  └─ layout/
│  ├─ hooks/
│  ├─ lib/
│  ├─ pages/
│  └─ styles/
├─ supabase/
│  └─ migrations/
├─ .env.example
├─ index.html
├─ package.json
├─ postcss.config.js
├─ tailwind.config.js
└─ vite.config.js
```

## Features

- সম্পূর্ণ Bangla UI
- আজকের available পণ্য ও category filtering
- sticky bottom cart (mobile)
- dynamic delivery notice, bKash number, radius, delivery charge
- same-day / next-day delivery auto logic
- public checkout without login
- order tracking with status + custom message
- admin dashboard for products, categories, orders, settings
- Supabase Auth + RLS ready
- realtime refresh for public catalog and admin orders

## Setup

1. `.env.example` কপি করে `.env` বানান।
2. আপনার Supabase project URL এবং anon key দিন।
3. `supabase/migrations/001_init_aarot.sql` চালান।
4. dependency install করুন: `npm install`
5. dev server চালান: `npm run dev`

## Notes

- `.env` না থাকলেও app demo mode-এ localStorage data দিয়ে চলবে।
- বাস্তব admin auth, RLS, এবং realtime পেতে Supabase env প্রয়োজন।
