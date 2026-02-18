import product1 from "@/assets/product-1.jpg";
import product2 from "@/assets/product-2.jpg";
import product3 from "@/assets/product-3.jpg";
import product4 from "@/assets/product-4.jpg";
import product5 from "@/assets/product-5.jpg";
import product6 from "@/assets/product-6.jpg";
import product7 from "@/assets/product-7.jpg";
import product8 from "@/assets/product-8.jpg";

export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  image: string;
  price: string;
  rating: number;
  ratingCount: number;
  whatsapp: string;
}

export const categories = [
  "Semua",
  "Seri baru",
  "Kets",
  "Elektronik",
  "Shop Craft",
  "Pasar Swalayan",
  "Sandhy",
];

export const defaultProducts: Product[] = [
  {
    id: "1",
    name: "Tas Selempang Wanita Premium – Elegan & Multifungsi",
    description: "Tas selempang kulit premium dengan desain elegan. Cocok untuk penggunaan sehari-hari maupun acara formal. Dilengkapi tali yang bisa disesuaikan dan kompartemen yang luas.",
    category: "Seri baru",
    image: product1,
    price: "Rp 250.000",
    rating: 4.5,
    ratingCount: 12,
    whatsapp: "6281234567890",
  },
  {
    id: "2",
    name: "Tote Bag Kulit Coklat – Casual & Stylish",
    description: "Tote bag berbahan kulit sintetis berkualitas tinggi. Desain minimalis dan ukuran besar membuatnya sempurna untuk membawa banyak barang.",
    category: "Seri baru",
    image: product2,
    price: "Rp 320.000",
    rating: 4,
    ratingCount: 8,
    whatsapp: "6281234567890",
  },
  {
    id: "3",
    name: "Ransel Canvas Premium – Nyaman & Tahan Lama",
    description: "Ransel canvas berkualitas dengan aksen kulit. Ideal untuk traveling, sekolah, atau kegiatan outdoor.",
    category: "Kets",
    image: product3,
    price: "Rp 180.000",
    rating: 5,
    ratingCount: 20,
    whatsapp: "6281234567890",
  },
  {
    id: "4",
    name: "Clutch Hitam Gold – Mewah & Elegan",
    description: "Clutch hitam dengan aksen emas. Sempurna untuk acara pesta, dinner, atau pertemuan formal.",
    category: "Elektronik",
    image: product4,
    price: "Rp 150.000",
    rating: 3.5,
    ratingCount: 5,
    whatsapp: "6281234567890",
  },
  {
    id: "5",
    name: "Messenger Bag Olive – Sporty & Fungsional",
    description: "Tas messenger berbahan nylon tahan air. Cocok untuk pria maupun wanita yang aktif dan dinamis.",
    category: "Shop Craft",
    image: product5,
    price: "Rp 200.000",
    rating: 4,
    ratingCount: 15,
    whatsapp: "6281234567890",
  },
  {
    id: "6",
    name: "Tas Rotan Handmade – Bohemian Style",
    description: "Tas rotan anyaman tangan khas Indonesia. Unik, ramah lingkungan, dan cocok untuk gaya bohemian.",
    category: "Shop Craft",
    image: product6,
    price: "Rp 275.000",
    rating: 4.5,
    ratingCount: 18,
    whatsapp: "6281234567890",
  },
  {
    id: "7",
    name: "Shoulder Bag Merah – Bold & Fashionable",
    description: "Tas bahu kulit merah maroon yang berani dan stylish. Menambah sentuhan warna pada outfit Anda.",
    category: "Seri baru",
    image: product7,
    price: "Rp 290.000",
    rating: 4,
    ratingCount: 10,
    whatsapp: "6281234567890",
  },
  {
    id: "8",
    name: "Bucket Bag Cream – Simple & Cute",
    description: "Tas bucket kecil berwarna krem. Desain simpel namun menggemaskan, cocok untuk jalan-jalan santai.",
    category: "Pasar Swalayan",
    image: product8,
    price: "Rp 125.000",
    rating: 3,
    ratingCount: 6,
    whatsapp: "6281234567890",
  },
];
