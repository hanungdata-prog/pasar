# 🚀 Deploy ke Vercel - Panduan Lengkap

## ✅ Prerequisites

1. **Akun Vercel** - Daftar di [vercel.com](https://vercel.com) (gratis)
2. **Akun MongoDB Atlas** - Pastikan database sudah ada di [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
3. **GitHub/GitLab/Bitbucket** - Untuk connect repository

---

## 📋 Langkah-langkah Deploy

### Step 1: Install Dependencies

```bash
npm install @vercel/node --save
```

### Step 2: Setup MongoDB Atlas

1. Login ke MongoDB Atlas
2. Pastikan database `connect-rate` sudah ada
3. Dapatkan connection string:
   - Database → Connect → Connect your application
   - Copy connection string (contoh: `mongodb+srv://username:password@cluster.mongodb.net/connect-rate`)

### Step 3: Buat File .env.local (untuk testing lokal)

```bash
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/connect-rate
```

### Step 4: Push ke GitHub

```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

### Step 5: Deploy ke Vercel

**Cara 1: Via Vercel Dashboard (Recommended)**

1. Login ke [vercel.com](https://vercel.com)
2. Click **"Add New Project"**
3. Import dari GitHub repository Anda
4. **Configure Project:**
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

5. **Environment Variables** (PENTING!):
   - Click **"Environment Variables"**
   - Add variable: `MONGODB_URI`
   - Value: connection string MongoDB Atlas Anda
   - Environment: Production ✅

6. Click **"Deploy"**

**Cara 2: Via Vercel CLI**

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Follow prompts:
# - Set up and deploy? Y
# - Which scope? (pilih akun Anda)
# - Link to existing project? N
# - Project name? connect-rate
# - Directory? ./
# - Override settings? N

# Set environment variable
vercel env add MONGODB_URI production
# Paste MongoDB connection string

# Deploy production
vercel --prod
```

---

## 🔧 Struktur File API

```
connect-rate/
├── api/
│   ├── lib/
│   │   ├── db.js          # MongoDB connection
│   │   └── global.d.ts    # TypeScript types
│   ├── models/
│   │   ├── User.js
│   │   ├── Product.js
│   │   └── Rating.js
│   ├── users/
│   │   └── index.js       # GET/POST /api/users
│   ├── products/
│   │   ├── index.js       # GET/POST /api/products
│   │   ├── [id].js        # GET/PUT/DELETE /api/products/:id
│   │   └── stats/
│   │       └── general.js # GET /api/products/stats/general
│   └── ratings/
│       ├── index.js       # GET/POST /api/ratings
│       └── stats/
│           └── [productId].js  # GET /api/ratings/stats/:productId
├── src/                   # Frontend React
├── vercel.json            # Vercel config
└── package.json
```

---

## 🌐 URL Endpoints

Setelah deploy, API endpoints akan tersedia di:

```
https://your-project.vercel.app/api/users
https://your-project.vercel.app/api/products
https://your-project.vercel.app/api/products/:id
https://your-project.vercel.app/api/ratings
https://your-project.vercel.app/api/ratings/stats/:productId
https://your-project.vercel.app/api/products/stats/general
```

Frontend otomatis terhubung karena menggunakan relative URL (`/api`).

---

## 🧪 Testing Lokal

```bash
# Install dependencies
npm install

# Setup .env.local
cp .env.example .env.local
# Edit .env.local, tambahkan MONGODB_URI

# Run development
npm run dev
```

---

## ⚠️ Troubleshooting

### Error: MongoDB connection failed
- Pastikan IP address 0.0.0.0/0 di MongoDB Atlas Network Access
- Check username/password di connection string

### Error: API 404 Not Found
- Pastikan `vercel.json` ada di root folder
- Check struktur folder `api/`

### Error: Build failed
- Run `npm run build` lokal untuk test
- Fix TypeScript errors jika ada

### Frontend tidak connect ke API
- Check `src/services/api.ts` menggunakan `/api` (relative URL)
- Environment variable `MONGODB_URI` sudah di-set di Vercel

---

## 🎯 Tips

1. **Auto Deploy**: Setiap push ke GitHub = auto deploy ke Vercel
2. **Preview Deployments**: Pull request = deploy preview otomatis
3. **Logs**: Check logs di Vercel Dashboard → Activity
4. **Custom Domain**: Settings → Domains → Add domain
5. **Analytics**: Enable Vercel Analytics di Settings

---

## 💰 Biaya

**Vercel Free Tier:**
- ✅ Unlimited deployments
- ✅ 100GB bandwidth/bulan
- ✅ Serverless functions (10GB hours/bulan)
- ✅ Auto SSL certificate

**Cukup untuk aplikasi ini!** 🎉

---

## 📞 Butuh Bantuan?

- Vercel Docs: [vercel.com/docs](https://vercel.com/docs)
- MongoDB Atlas Docs: [mongodb.com/docs/atlas](https://www.mongodb.com/docs/atlas)

**Happy Deploying!** 🚀
