import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import Header from "@/components/Header";
import TagToggle from "@/components/TagToggle";
import ProductCard from "@/components/ProductCard";
import UsernameModal from "@/components/UsernameModal";
import { categories } from "@/lib/products";
import { getProducts, getUsername } from "@/lib/store";

const ITEMS_PER_PAGE = 8;

const Index = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<string | null>(categories[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const [username, setUsernameState] = useState<string | null>(getUsername());
  const [products, setProducts] = useState(getProducts());

  useEffect(() => {
    setProducts(getProducts());
  }, []);

  const filtered = useMemo(() => {
    let items = products;
    if (activeCategory) {
      items = items.filter((p) => p.category === activeCategory);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      items = items.filter(
        (p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
      );
    }
    return items;
  }, [products, activeCategory, searchQuery]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paged = filtered.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE);

  return (
    <div className="min-h-screen flex flex-col">
      {!username && <UsernameModal onComplete={(n) => setUsernameState(n)} />}

      <Header onSearch={setSearchQuery} />

      <main className="flex-1 px-8 py-4">
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          {categories.map((cat) => (
            <TagToggle
              key={cat}
              label={cat}
              active={activeCategory === cat}
              onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
            />
          ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {paged.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20 text-foreground/50">
            <p className="text-lg">Tidak ada produk ditemukan</p>
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
      </main>

      <button
        onClick={() => navigate("/upload")}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:opacity-90 transition-opacity z-10"
      >
        <Plus className="w-7 h-7" />
      </button>
    </div>
  );
};

export default Index;
