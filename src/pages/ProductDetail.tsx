import { useParams, useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import { ArrowLeft, MessageCircle } from "lucide-react";
import Header from "@/components/Header";
import StarRating from "@/components/StarRating";
import { getProducts, getUsername, addRating, getProductRating } from "@/lib/store";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const products = getProducts();
  const product = useMemo(() => products.find((p) => p.id === id), [id, products]);
  const username = getUsername();
  const [ratingState, setRatingState] = useState(() => getProductRating(id || ""));
  const [userRating, setUserRating] = useState(0);

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center text-foreground/50">
          Produk tidak ditemukan
        </div>
      </div>
    );
  }

  const handleRate = (rating: number) => {
    if (!username) return;
    setUserRating(rating);
    addRating(product.id, username, rating);
    setRatingState(getProductRating(product.id));
  };

  const displayRating = ratingState.count > 0 ? ratingState.avg : product.rating;
  const displayCount = ratingState.count > 0 ? ratingState.count : product.ratingCount;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 px-6 py-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-sm text-foreground/60 hover:text-foreground mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali
        </button>

        <div className="bg-popover rounded-3xl overflow-hidden shadow-xl max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row">
            <div className="md:w-1/2 aspect-square bg-popover overflow-hidden">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="md:w-1/2 p-8 flex flex-col gap-4">
              <h1 className="text-lg font-semibold text-popover-foreground">
                {product.name}
              </h1>
              <p className="text-sm text-popover-foreground/70 leading-relaxed">
                {product.description}
              </p>
              <p className="text-xl font-bold text-popover-foreground">{product.price}</p>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <StarRating rating={displayRating} size={18} />
                  <span className="text-sm text-popover-foreground/60">
                    {displayRating.toFixed(1)} ({displayCount} ulasan)
                  </span>
                </div>

                {username && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-popover-foreground/50">Beri rating:</span>
                    <StarRating
                      rating={userRating}
                      onRate={handleRate}
                      size={22}
                      interactive
                    />
                  </div>
                )}
              </div>

              <button
                onClick={() =>
                  window.open(
                    `https://wa.me/${product.whatsapp}?text=Halo, saya ${username || "pembeli"} tertarik dengan produk: ${product.name}`,
                    "_blank"
                  )
                }
                className="mt-auto flex items-center justify-center gap-2 py-3 rounded-full bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
              >
                <MessageCircle className="w-5 h-5" />
                Chat via WhatsApp
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProductDetail;
