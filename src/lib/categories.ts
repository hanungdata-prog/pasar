// Category structure with main categories and subcategories
export const CATEGORIES = [
  {
    id: 'fashion',
    name: 'Fashion & Aksesori',
    subcategories: [
      'Pakaian Pria',
      'Pakaian Wanita',
      'Pakaian Anak',
      'Sepatu',
      'Tas',
      'Jam Tangan',
      'Perhiasan',
      'Aksesori Fashion',
    ],
  },
  {
    id: 'electronics',
    name: 'Elektronik & Gadget',
    subcategories: [
      'Handphone & Tablet',
      'Laptop & Komputer',
      'Aksesori HP & Komputer',
      'Kamera',
      'Audio',
      'TV & Home Entertainment',
      'Smart Home',
    ],
  },
  {
    id: 'home',
    name: 'Rumah Tangga',
    subcategories: [
      'Peralatan Dapur',
      'Perabotan Rumah',
      'Dekorasi Rumah',
      'Perlengkapan Kamar Mandi',
      'Sprei & Bed Cover',
      'Peralatan Kebersihan',
    ],
  },
  {
    id: 'mother-child',
    name: 'Ibu & Anak',
    subcategories: [
      'Perlengkapan Bayi',
      'Mainan Anak',
      'Pakaian Bayi',
      'Makanan & Susu Bayi',
      'Stroller & Car Seat',
    ],
  },
  {
    id: 'beauty',
    name: 'Kecantikan & Perawatan Diri',
    subcategories: [
      'Skincare',
      'Makeup',
      'Parfum',
      'Perawatan Rambut',
      'Alat Kecantikan',
    ],
  },
  {
    id: 'food-beverage',
    name: 'Makanan & Minuman',
    subcategories: [
      'Makanan Ringan',
      'Minuman',
      'Bahan Masak',
      'Produk UMKM',
      'Makanan Instan',
    ],
  },
  {
    id: 'sports-hobby',
    name: 'Olahraga & Hobi',
    subcategories: [
      'Alat Fitness',
      'Sepeda',
      'Perlengkapan Outdoor',
      'Alat Musik',
      'Koleksi & Hobi',
    ],
  },
  {
    id: 'automotive',
    name: 'Otomotif',
    subcategories: [
      'Suku Cadang Motor',
      'Suku Cadang Mobil',
      'Aksesoris Kendaraan',
      'Helm & Riding Gear',
    ],
  },
  {
    id: 'office-industry',
    name: 'Kantor & Industri',
    subcategories: [
      'Alat Tulis',
      'Peralatan Kantor',
      'Mesin Industri',
      'Peralatan Usaha',
    ],
  },
  {
    id: 'pets',
    name: 'Hewan Peliharaan',
    subcategories: [
      'Makanan Hewan',
      'Aksesoris Hewan',
      'Kandang',
      'Vitamin Hewan',
    ],
  },
  {
    id: 'gaming',
    name: 'Gaming',
    subcategories: [
      'Console',
      'Game',
      'Aksesoris Gaming',
      'Voucher Game',
    ],
  },
  {
    id: 'digital',
    name: 'Produk Digital',
    subcategories: [
      'Pulsa & Paket Data',
      'Voucher',
      'Tiket',
      'Top Up Game',
      'E-book',
    ],
  },
];

// Helper function to get all subcategories as flat array
export const getAllSubcategories = () => {
  return CATEGORIES.flatMap(cat => cat.subcategories);
};

// Helper function to get category by subcategory name
export const getCategoryBySubcategory = (subcategory: string) => {
  return CATEGORIES.find(cat => cat.subcategories.includes(subcategory));
};
