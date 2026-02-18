import { MessageCircle, ShoppingCart, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/lib/cart";
import { toast } from "@/hooks/use-toast";

interface ProductCardProps {
  product: {
    id: string;
    _id?: string;
    name: string;
    description: string;
    category: string;
    image: string;
    images?: string[];
    price: string;
    rating: number;
    ratingCount: number;
    whatsapp: string;
  };
}

const ProductCard = ({ product }: ProductCardProps) => {
  const navigate = useNavigate();
  const addToCart = useCart((s) => s.addToCart);
  const displayRating = product.rating || 0;
  const displayCount = product.ratingCount || 0;
  const displayImage = product.images?.[0] || product.image;

  return (
    <div
      className="relative rounded-2xl overflow-hidden cursor-pointer group transition-transform hover:scale-[1.02]"
      onClick={() => navigate(`/product/${product.id}`)}
    >
      <div className="w-full aspect-square bg-popover overflow-hidden">
        <img
          src={displayImage}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
      </div>

      <div className="bg-card p-3 relative">
        <p className="text-xs text-card-foreground leading-tight line-clamp-2 mb-1">
          {product.name}
        </p>
        <div className="w-3/4 h-px bg-foreground/20 my-1.5" />
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] text-muted-foreground">Show Details</p>
            <div className="flex items-center gap-1 mt-0.5">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={10}
                    className={
                      star <= Math.round(displayRating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "fill-transparent text-foreground/30"
                    }
                  />
                ))}
              </div>
              <span className="text-[9px] text-muted-foreground">({displayCount})</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={(e) => {
                e.stopPropagation();
                addToCart(product);
                toast({ title: "Ditambahkan ke keranjang!", description: product.name });
              }}
              className="bg-primary/80 p-1.5 rounded-full hover:bg-primary transition-colors"
            >
              <ShoppingCart className="w-4 h-4 text-primary-foreground" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                const waNumber = (product.whatsapp || "6281234567890").replace(/^\+62/, "62");
                window.open(`https://wa.me/${waNumber}?text=Halo, saya tertarik dengan produk: ${product.name}`, "_blank");
              }}
              className="bg-popover/80 p-1.5 rounded-full hover:bg-popover transition-colors"
            >
              <MessageCircle className="w-4 h-4 text-card-foreground" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
