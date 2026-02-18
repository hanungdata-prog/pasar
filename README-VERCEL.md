# 🛒 Connect Rate - Fullstack E-Commerce

Pasar online modern dengan rating & review sistem.

## 🚀 Quick Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/connect-rate)

### 1-Click Deploy Steps:

1. **Click tombol "Deploy with Vercel"** di atas
2. **Connect MongoDB Atlas:**
   - Buat akun gratis di [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
   - Buat cluster baru (free tier M0)
   - Dapatkan connection string
3. **Set Environment Variables di Vercel:**
   - `MONGODB_URI` = MongoDB connection string Anda
4. **Deploy!** 🎉

---

## 📁 Struktur Project

```
connect-rate/
├── api/              # Backend Serverless Functions
│   ├── users/        # User authentication
│   ├── products/     # Product CRUD
│   └── ratings/      # Rating & review system
├── src/              # Frontend React + Vite
├── vercel.json       # Vercel configuration
└── package.json
```

---

## 🛠️ Development

```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env.local
# Edit .env.local dengan MongoDB URI

# Run development server
npm run dev
```

---

## 📦 Features

- ✅ **User Authentication** - WhatsApp-based login
- ✅ **Product Management** - Upload, edit, delete products
- ✅ **Shopping Cart** - Add to cart & checkout via WhatsApp
- ✅ **Rating System** - 5-star rating dengan reviews
- ✅ **Category Filter** - 12 kategori dengan subkategori
- ✅ **Image Gallery** - Upload hingga 5 gambar per produk
- ✅ **Responsive Design** - Mobile-friendly UI
- ✅ **Serverless Backend** - Deploy gratis di Vercel

---

## 💰 Gratis 100%!

- **Frontend + Backend:** Vercel Free Tier
- **Database:** MongoDB Atlas Free Tier (512MB)
- **Total:** Rp 0/bulan

---

## 📖 Dokumentasi Lengkap

Lihat [DEPLOYMENT.md](./DEPLOYMENT.md) untuk panduan deploy detail.

---

## 🎯 Tech Stack

- **Frontend:** React 18, Vite, TypeScript, TailwindCSS
- **Backend:** Vercel Serverless Functions (Node.js)
- **Database:** MongoDB Atlas
- **UI Components:** shadcn/ui, Radix UI
- **State Management:** Zustand
- **Forms:** React Hook Form + Zod

---

**Made with ❤️ for Indonesian UMKM**
