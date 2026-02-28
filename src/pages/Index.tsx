import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Plus, ShoppingCart } from "lucide-react";
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import { CategoryFilter } from "@/components/CategoryFilter";
import { productAPI } from "@/services/api";
import { useCart } from "@/lib/cart";
import { CATEGORIES } from "@/lib/categories";
import { useUserStore } from "@/stores/userStore";

const ITEMS_PER_PAGE = 32;

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useUserStore();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const [products, setProducts] = useState<any[]>([]);
  const cartTotal = useCart((s) => s.totalItems());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await productAPI.getAll({ limit: 200 });
      if (response.success) {
        setProducts(response.data);
      }
    } catch (error) {
      console.error("Failed to load products:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filtered = useMemo(() => {
    let items = products;
    if (activeCategory) {
      items = items.filter((p) => p.category === activeCategory || p.mainCategory === activeCategory);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      items = items.filter(
        (p) => p.name.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q) ||
          p.mainCategory?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q)
      );
    }
    return items;
  }, [products, activeCategory, searchQuery]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paged = filtered.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE);

  return (
    <div className="min-h-screen flex flex-col">
      <Header onSearch={setSearchQuery} />

      <main className="flex-1 px-4 sm:px-8 py-4">
        {/* Modern Category Filter */}
        <CategoryFilter
          activeCategory={activeCategory}
          onCategoryChange={(category) => {
            setActiveCategory(category);
            setPage(0);
          }}
        />

        {isLoading ? (
          <div className="text-center py-20 text-foreground/50">
            <p className="text-lg">Memuat produk...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
              {paged.map((product) => (
                <ProductCard
                  key={product._id || product.id}
                  product={{
                    id: product._id || product.id,
                    name: product.name,
                    description: product.description || "",
                    category: product.category || "",
                    image: product.image || "/placeholder.svg",
                    images: product.images,
                    price: product.price ? `Rp ${product.price.toLocaleString('id-ID')}` : "",
                    rating: product.averageRating || 0,
                    ratingCount: product.totalRatings || 0,
                    whatsapp: (product.whatsapp || "6281234567890").replace(/^\+62/, "62"),
                  }}
                />
              ))}
            </div>

            {filtered.length === 0 && (
              <div className="text-center py-20 text-foreground/50">
                <p className="text-lg">Tidak ada produk ditemukan</p>
                <p className="text-sm mt-2">Coba kategori lain atau kata kunci yang berbeda</p>
              </div>
            )}

            <div className="flex items-center justify-center gap-4 mt-6 mb-4">
              <button
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
                className="p-2 rounded-lg bg-accent/50 text-accent-foreground disabled:opacity-30"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-sm text-foreground/70">
                {page + 1} / {Math.max(1, totalPages)}
              </span>
              <button
                onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                disabled={page >= totalPages - 1}
                className="p-2 rounded-lg bg-accent/50 text-accent-foreground disabled:opacity-30"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </>
        )}
      </main>

      {/* Floating Action Buttons - Vertical Stack on Bottom Right */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-10">
        {/* Cart Button - Top */}
        <button
          onClick={() => navigate("/cart")}
          className="relative w-14 h-14 rounded-full bg-accent text-accent-foreground shadow-lg flex items-center justify-center hover:opacity-90 transition-opacity"
        >
          <ShoppingCart className="w-6 h-6" />
          {cartTotal > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">
              {cartTotal}
            </span>
          )}
        </button>

        {/* Upload Button - Bottom */}
        <button
          onClick={() => isAuthenticated ? navigate("/upload") : navigate("/login")}
          className="w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:opacity-90 transition-opacity"
        >
          <Plus className="w-7 h-7" />
        </button>
      </div>
    </div>
  );
};

export default Index;
