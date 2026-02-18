import { MessageCircle, ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import StarRating from "./StarRating";
import { Product } from "@/lib/products";
import { getProductRating } from "@/lib/store";
import { useCart } from "@/lib/cart";
import { toast } from "@/hooks/use-toast";

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const navigate = useNavigate();
  const addToCart = useCart((s) => s.addToCart);
  const { avg, count } = getProductRating(product.id);
  const displayRating = count > 0 ? avg : product.rating;
  const displayCount = count > 0 ? count : product.ratingCount;

  return (
    <div
      className="relative rounded-2xl overflow-hidden cursor-pointer group transition-transform hover:scale-[1.02]"
      onClick={() => navigate(`/product/${product.id}`)}
    >
      <div className="w-full aspect-square bg-popover overflow-hidden">
        <img
          src={product.image}
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
              <StarRating rating={displayRating} size={10} />
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
                window.open(`https://wa.me/${product.whatsapp}?text=Halo, saya tertarik dengan produk: ${product.name}`, "_blank");
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
