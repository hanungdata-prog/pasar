import { MessageCircle, ShoppingCart, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/lib/cart";
import { toast } from "@/hooks/use-toast";
import { getImageUrl } from "@/lib/image";

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
  const displayImage = getImageUrl(product.images?.[0] || product.image);

  return (
    <div
      className="relative bg-card rounded-2xl overflow-hidden cursor-pointer group hover:-translate-y-1 hover:shadow-xl transition-all duration-300 border border-border/50"
      onClick={() => navigate(`/product/${product.id}`)}
    >
      <div className="w-full aspect-square bg-muted overflow-hidden">
        <img
          src={displayImage}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          referrerPolicy="strict-origin-when-cross-origin"
          onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg"; }}
        />
      </div>

      <div className="p-3 sm:p-4 relative">
        <p className="text-xs text-card-foreground leading-tight line-clamp-2 mb-1">
          {product.name}
        </p>
        <div className="w-3/4 h-px bg-foreground/20 my-1.5" />
        <div className="flex items-center justify-between mt-2">
          <div className="flex flex-col">
            <span className="text-sm sm:text-base font-bold text-foreground">{product.price}</span>
            <div className="flex items-center gap-1 mt-0.5">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={12}
                    className={
                      star <= Math.round(displayRating)
                        ? "fill-yellow-400 text-yellow-400 leading-none"
                        : "fill-transparent text-foreground/30 leading-none"
                    }
                  />
                ))}
              </div>
              <span className="text-[10px] sm:text-xs text-muted-foreground ml-1">({displayCount})</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={(e) => {
                e.stopPropagation();
                addToCart(product);
                toast({ title: "Ditambahkan ke keranjang!", description: product.name });
              }}
              className="bg-primary hover:bg-primary/90 p-2 rounded-full transition-colors shadow-sm"
            >
              <ShoppingCart className="w-4 h-4 text-primary-foreground" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                const waNumber = (product.whatsapp || "6281234567890").replace(/^\+62/, "62");
                window.open(`https://wa.me/${waNumber}?text=Halo, saya tertarik dengan produk: ${product.name}`, "_blank");
              }}
              className="bg-green-500 hover:bg-green-600 p-2 rounded-full transition-colors shadow-sm"
            >
              <MessageCircle className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
